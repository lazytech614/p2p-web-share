import express from "express";
import cors from "cors";

import type { Room } from "@repo/types";

const room: Room = {
  roomId: "test-room",
  createdAt: Date.now(),
};

console.log(room);

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "P2P Web Share Server Running",
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});