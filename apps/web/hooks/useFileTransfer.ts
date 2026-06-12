import { useRef, useState } from "react";
import type { DataConnection } from "peerjs";
import type {
  FileMetadata,
  DataChannelMessage,
  TransferRecord
} from "@repo/types";
import { 
  calculateSpeed, 
  CHUNK_SIZE, 
  estimateTimeLeft, 
  reassembleChunks, 
  splitFileIntoChunks 
} from "@/lib/fileChunker";
import { hashBlob, hashFile } from "@/lib/crypto";
import { triggerDownload } from "@/lib/download";
import { clearChunks, loadAllChunks, saveChunk } from "@/lib/indexedDb";

export function useFileTransfer() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [incomingFile, setIncomingFile] = useState<FileMetadata | null>(null);
    const [receivedBlob, setReceivedBlob] = useState<Blob | null>(null);
    const [sendProgress, setSendProgress] = useState(0);
    const [receiveProgress, setReceiveProgress] = useState(0);
    const [uploadSpeed, setUploadSpeed] = useState(0);
    const [uploadETA, setUploadETA] = useState("");
    const [downloadSpeed, setDownloadSpeed] = useState(0);
    const [downloadETA, setDownloadETA] = useState("");
    const [verified, setVerified] = useState<boolean | null>(null);
    const [history, setHistory] = useState<TransferRecord[]>([]);
    const [autoDownload, _setAutoDownload] = useState(false)

    const chunksRef = useRef<ArrayBuffer[]>([]);
    const incomingFileRef = useRef<FileMetadata | null>(null);
    const downloadStartTimeRef = useRef(0);
    const senderHashRef = useRef("");
    const rebuiltHashRef = useRef("");
    const autoDownloadRef = useRef(false);
    const receivedChunksRef = useRef(0);
    const bytesReceivedRef = useRef(0);  

    const setAutoDownload = (value: boolean) => {
      autoDownloadRef.current = value;
      _setAutoDownload(value);
    };

    const tryVerify = () => {
      if (!senderHashRef.current) return;
      if (!rebuiltHashRef.current) return;

      const isValid = senderHashRef.current === rebuiltHashRef.current;
      setVerified(isValid);

      setHistory(prev => [
        ...prev,
        {
          name: incomingFileRef.current!.name,
          size: incomingFileRef.current!.size,
          verified: true,
          timestamp: Date.now(),
        },
      ]);
    };

    const sendMetadata = (connection: DataConnection) => {
        if (!connection) return;
        if (!selectedFile) return;

        const metadata = {
        type: "metadata",
        payload: {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
        },
        };

        connection.send(metadata);
    };

    const sendFile = async (connection: DataConnection) => {
        if (!connection) return;
        if (!selectedFile) return;

        const totalChunks =
        Math.ceil(
          selectedFile.size /
          CHUNK_SIZE
        );
    
        const startTime = Date.now();
        const buffer = await selectedFile.arrayBuffer();
        const chunks = splitFileIntoChunks(buffer);
        const hash = await hashFile(selectedFile);
    
        for (let index = 0; index < totalChunks; index++) {
          const start = index * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, selectedFile.size);
          const blob = selectedFile.slice(start, end);
          const chunk = await blob.arrayBuffer();

          await waitForBuffer(connection);

          connection.send({
            type: "file-chunk",
            payload: {
              chunk,
              index,
              totalChunks,
            },
          });

          const progress = Math.round(((index + 1) / chunks.length) * 100);
          setSendProgress(progress);
    
          const bytesTransferred = (index + 1) * CHUNK_SIZE;
          const speed = calculateSpeed(bytesTransferred, startTime);
          const eta = estimateTimeLeft(buffer.byteLength, bytesTransferred, speed);
          setUploadSpeed(speed);
          setUploadETA(eta);
        }

        connection.send({
          type: "hash",
          payload: {
            sha256: hash,
          },
        });
    };

    const handleIncomingData = async (rawData: unknown) => {
        const data = rawData as DataChannelMessage;
        
        if (data.type === "metadata") {
            setIncomingFile(data.payload);
            // chunksRef.current = [];
            receivedChunksRef.current = 0;
            bytesReceivedRef.current = 0;
            await clearChunks();
            incomingFileRef.current = data.payload;
            downloadStartTimeRef.current = Date.now();
            setVerified(null);
            senderHashRef.current = "";
            rebuiltHashRef.current = "";
        }
        
        if (data.type === "file-chunk") {
            const {
                chunk,
                index,
                totalChunks,
             } = data.payload;
        
            // chunksRef.current[index] = chunk;              
            await saveChunk(index, chunk);
            receivedChunksRef.current++;
            // const received = chunksRef.current.filter(Boolean).length;      
            const received = receivedChunksRef.current;
            const progress = Math.round((received / totalChunks) * 100);
            setReceiveProgress(progress);
        
            bytesReceivedRef.current += chunk.byteLength;
            const bytesReceived = bytesReceivedRef.current;
            const speed = calculateSpeed(bytesReceived, downloadStartTimeRef.current);
            const eta = estimateTimeLeft(incomingFileRef.current?.size || 0, bytesReceived, speed);
            setDownloadSpeed(speed);
            setDownloadETA(eta);
        
            if (received === totalChunks ) {        
                // const blob = reassembleChunks(chunksRef.current);        
                const chunks =
                await loadAllChunks();
                const blob = new Blob(chunks, 
                  {
                    type: incomingFileRef.current?.type,
                  });
                setReceivedBlob(blob);

                const rebuiltHash = await hashBlob(blob);
                rebuiltHashRef.current = rebuiltHash;

                tryVerify();
                if (autoDownloadRef.current) {
                  triggerDownload(blob, incomingFileRef.current!.name);
                }
            }
        }

        if (data.type === "hash") {
          senderHashRef.current = data.payload.sha256;
          tryVerify();
        }
    };

  return {
    selectedFile,
    setSelectedFile,
    incomingFile,
    setIncomingFile,
    receivedBlob,
    setReceivedBlob,
    sendMetadata,
    sendFile,
    handleIncomingData,
    sendProgress,
    receiveProgress,
    uploadSpeed,
    uploadETA,
    downloadSpeed,
    downloadETA,
    verified,
    autoDownload,
    setAutoDownload,
  };
}

async function waitForBuffer(
  connection: DataConnection
) {
  const dc =
    connection.dataChannel;

  while (
    dc.bufferedAmount >
    8 * 1024 * 1024
  ) {
    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          10
        )
    );
  }
}