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

    const chunksRef = useRef<ArrayBuffer[]>([]);
    const incomingFileRef = useRef<FileMetadata | null>(null);
    const downloadStartTimeRef = useRef(0);
    const senderHashRef = useRef("");
    const rebuiltHashRef = useRef("");

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
    
        const startTime = Date.now();
        const buffer = await selectedFile.arrayBuffer();
        const chunks = splitFileIntoChunks(buffer);
        const hash = await hashFile(selectedFile);
    
        for (let index = 0; index < chunks.length; index++) {
          connection.send({
            type: "file-chunk",
            payload: {
              chunk: chunks[index],
              index,
              totalChunks: chunks.length,
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
            chunksRef.current = [];
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
        
            chunksRef.current[index] = chunk;              
            const received = chunksRef.current.filter(Boolean).length;      
            const progress = Math.round((received / totalChunks) * 100);
            setReceiveProgress(progress);
        
            const bytesReceived = chunksRef.current.reduce((sum, chunk) => sum + chunk.byteLength, 0);
            const speed = calculateSpeed(bytesReceived, downloadStartTimeRef.current);
            const eta = estimateTimeLeft(incomingFileRef.current?.size || 0, bytesReceived, speed);
            setDownloadSpeed(speed);
            setDownloadETA(eta);
        
            if (received === totalChunks ) {        
                const blob = reassembleChunks(chunksRef.current);        
                setReceivedBlob(blob);

                const rebuiltHash = await hashBlob(blob);
                rebuiltHashRef.current = rebuiltHash;

                tryVerify();
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
    verified
  };
}