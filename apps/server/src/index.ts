import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { setupSocket } from "./socket";

const app = express();

app.use(cors({
  origin: ["https://p2p-web-share-web.vercel.app", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());

const httpServer = createServer(app);
setupSocket(httpServer);

const PORT = process.env.PORT || 5000;

app.get("/", (_, res) => {
  res.send("Server Running");
});

httpServer.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});