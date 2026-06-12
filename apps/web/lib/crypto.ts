export async function hashFile(
  file: File
) {
  const buffer = await file.arrayBuffer();

  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

  return Array
    .from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashBlob(
  blob: Blob
) {
  const buffer = await blob.arrayBuffer();

  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

  return Array
    .from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function generateAESKey() {
  return crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function exportKey(
  key: CryptoKey
) {
  const raw =
    await crypto.subtle.exportKey(
      "raw",
      key
    );

  return btoa(
    String.fromCharCode(
      ...new Uint8Array(raw)
    )
  );
}

export async function importKey(
  keyString: string
) {
  const binary =
    Uint8Array.from(
      atob(keyString),
      c => c.charCodeAt(0)
    );

  return crypto.subtle.importKey(
    "raw",
    binary,
    {
      name: "AES-GCM",
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptChunk(
  chunk: ArrayBuffer,
  key: CryptoKey
) {
  const iv =
    crypto.getRandomValues(
      new Uint8Array(12)
    );

  const encrypted =
    await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      chunk
    );

  return {
    iv,
    encrypted,
  };
}

export async function decryptChunk(
  encrypted: ArrayBuffer,
  iv: ArrayBufferView,
  key: CryptoKey
) {
  return crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(iv as unknown as ArrayBuffer),
    },
    key,
    encrypted
  );
}