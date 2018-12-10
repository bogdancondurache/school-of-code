FROM golang:alpine as source
RUN apk --update add git
WORKDIR /home/compiler
COPY ./app .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -mod vendor

FROM scratch as runner
LABEL maintainer="Bogdan Condurache <bogdan@condurache.me>"
WORKDIR /home/compiler
COPY --from=source /home/compiler/online-compiler ./compiler
ENTRYPOINT ["/home/compiler/compiler"]
