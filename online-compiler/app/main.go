package main

import (
	"context"
	"errors"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"

	"github.com/docker/docker/client"
	"github.com/gorilla/websocket"
)

const (
	writeWait        = 10 * time.Second
	maxMessageSize   = 81920
	pongWait         = 60 * time.Second
	pingPeriod       = (pongWait * 9) / 10
	closeGracePeriod = 10 * time.Second
)

var upgrader = websocket.Upgrader{}
var imageName = "frolvlad/alpine-gxx"
var cli, _ = client.NewEnvClient()

func process(ws *websocket.Conn, done chan struct{}) {
	defer close(done)
	defer ws.Close()

	ws.SetReadLimit(maxMessageSize)
	ws.SetReadDeadline(time.Now().Add(pongWait))
	ws.SetPongHandler(func(string) error { ws.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := ws.ReadMessage()
		if err != nil {
			break
		}
		ctx := context.Background()
		code := string(message[:])
		code = strings.Replace(code, "\"", "\\\"", -1)

		resp, err := cli.ContainerCreate(ctx, &container.Config{
			Cmd:             []string{"sh", "-c", "echo \"" + code + "\" | g++ --static -o /main.o -xc++ - && /main.o"},
			NetworkDisabled: true,
			Image:           imageName,
			Tty:             true,
		}, nil, nil, "")
		if err != nil {
			panic(err)
		}

		if err := cli.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
			panic(err)
		}

		_, err = cli.ContainerWait(ctx, resp.ID)
		if err != nil {
			panic(err)
		}

		out, err := cli.ContainerLogs(ctx, resp.ID, types.ContainerLogsOptions{ShowStdout: true})
		if err != nil {
			panic(err)
		}
		ws.SetWriteDeadline(time.Now().Add(writeWait))
		result, err := ioutil.ReadAll(out)
		if err != nil {
			panic(err)
		}
		if err := ws.WriteMessage(websocket.TextMessage, result); err != nil {
			ws.Close()
		}

		err = cli.ContainerRemove(ctx, resp.ID, types.ContainerRemoveOptions{Force: true})
		if err != nil {
			panic(err)
		}
	}
}

func ping(ws *websocket.Conn, done chan struct{}) {
	ticker := time.NewTicker(pingPeriod)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			if err := ws.WriteControl(websocket.PingMessage, []byte{}, time.Now().Add(writeWait)); err != nil {
				log.Println("ping:", err)
			}
		case <-done:
			return
		}
	}
}

func serveWs(w http.ResponseWriter, r *http.Request) {
	log.Println("Serving /ws on websockets")
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return
	}

	defer ws.Close()

	done := make(chan struct{})
	go ping(ws, done)
	process(ws, done)

	ws.SetWriteDeadline(time.Now().Add(writeWait))
	ws.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
	time.Sleep(closeGracePeriod)
	ws.Close()
}

func main() {
	ctx := context.Background()
	if cli == nil {
		panic(errors.New("Docker cli not initialized"))
	}

	_, err := cli.ImagePull(ctx, imageName, types.ImagePullOptions{})
	if err != nil {
		panic(err)
	}
	http.HandleFunc("/ws", serveWs)
	log.Println("Starting to serve on 8080")
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", nil))
}
