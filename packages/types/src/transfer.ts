export interface TransferProgress {
  transferredBytes: number;
  totalBytes: number;
  percentage: number;
  speedMbps: number;
  remainingSeconds: number;
}