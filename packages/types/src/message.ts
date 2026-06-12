import type { FileMetadata } from "./file";

export interface MetadataMessage {
  type: "metadata";
  payload: FileMetadata;
}

export interface ChunkMessage {
  type: "chunk";
  chunkIndex: number;
  payload: ArrayBuffer;
}

export interface CompleteMessage {
  type: "complete";
}

export interface ErrorMessage {
  type: "error";
  message: string;
}

export type DataChannelMessage =
  | MetadataMessage
  | ChunkMessage
  | CompleteMessage
  | ErrorMessage;