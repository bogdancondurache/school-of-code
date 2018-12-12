FROM golang:alpine as source
WORKDIR /home/compiler
RUN apk --update add ca-certificates
COPY ./app .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -mod vendor

FROM scratch as runner
LABEL maintainer="Bogdan Condurache <bogdan@condurache.me>"
ENV PATH=/bin
COPY --from=source /home/compiler/online-compiler /bin/compiler
COPY --from=source /home/compiler/host.* ./
COPY --from=source /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
ENTRYPOINT ["compiler"]
