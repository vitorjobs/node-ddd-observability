package main

import (
  "net/http"
  "os"
)

func main() {
  if len(os.Args) != 2 {
    os.Exit(1)
  }

  response, err := http.Get(os.Args[1])
  if err != nil {
    os.Exit(1)
  }
  defer response.Body.Close()

  if response.StatusCode >= 200 && response.StatusCode < 400 {
    os.Exit(0)
  }

  os.Exit(1)
}
