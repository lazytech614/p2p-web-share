export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  checksum: string;
  totalChunks: number;
  uploadedAt: number;
}