import { createServer } from "http";
import { parse } from "url";
import next from "next";
import * as WebSocket from "ws";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const host = process.env.HOST ?? "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? "", true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocket.Server({ server });

  wss.on("connection", (socket, _req) => {
    console.log("new websocket connection");
    socket.on("message", (msg) => {
      console.log("new websocket message", msg);
    });
  });

  server.listen(port, host, () => {
    console.log(` Ready on http://localhost:${port}`);
  });
});
