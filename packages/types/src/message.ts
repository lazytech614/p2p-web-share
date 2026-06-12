import type { FileMetadata } from "./file";

export interface MetadataMessage {
  type: "metadata";
  payload: FileMetadata;
}

export interface FileDataMessage {
  type: "file-data";
  payload: ArrayBuffer;
}

export interface ChunkMessage {
  type: "file-chunk";

  payload: {
    chunk: ArrayBuffer;
    index: number;
    totalChunks: number;
  };
}

export interface CompleteMessage {
  type: "complete";
}

export interface ErrorMessage {
  type: "error";
  message: string;
}

export interface HashMessage {
  type: "hash";

  payload: {
    sha256: string;
  };
}

export type DataChannelMessage =
  | MetadataMessage
  | FileDataMessage
  | ChunkMessage
  | CompleteMessage
  | HashMessage
  | ErrorMessage;