FROM golang:1.24-alpine AS healthcheck-builder
WORKDIR /src
COPY images/mimir/healthcheck.go ./healthcheck.go
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /healthcheck ./healthcheck.go

FROM grafana/mimir:latest
COPY --from=healthcheck-builder /healthcheck /healthcheck
