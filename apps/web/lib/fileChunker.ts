export const CHUNK_SIZE = 64 * 1024;

export function splitFileIntoChunks(
  buffer: ArrayBuffer
) {
  const chunks:
    ArrayBuffer[] = [];

  let offset = 0;

  while (
    offset < buffer.byteLength
  ) {
    const chunk =
      buffer.slice(
        offset,
        offset +
          CHUNK_SIZE
      );

    chunks.push(chunk);

    offset += CHUNK_SIZE;
  }

  return chunks;
}

export function reassembleChunks(
  chunks: ArrayBuffer[]
) {
  return new Blob(chunks);
}

export function calculateSpeed(
  bytesTransferred: number,
  startTime: number
) {
  const elapsedSeconds =
    (Date.now() - startTime) / 1000;

  if (elapsedSeconds <= 0)
    return 0;

  return (
    bytesTransferred /
    elapsedSeconds
  );
}

export function estimateTimeLeft(
  totalBytes: number,
  transferredBytes: number,
  speed: number
): string {
  if (speed <= 0) return "—";

  const remaining = totalBytes - transferredBytes;
  const seconds = remaining / speed;

  if (seconds < 60) return `${Math.ceil(seconds)} s`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)} m`;
  return `${(seconds / 3600).toFixed(1)} h`;
}

export function formatBytes(
  bytes: number
) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
  ];

  const index =
    Math.floor(
      Math.log(bytes) /
      Math.log(1024)
    );

  return `${(
    bytes /
    Math.pow(
      1024,
      index
    )
  ).toFixed(2)} ${
    units[index]
  }`;
}

export function formatSpeed(
  bytesPerSecond: number
) {
  return `${formatBytes(
    bytesPerSecond
  )}/s`;
}