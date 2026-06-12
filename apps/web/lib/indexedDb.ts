const DB_NAME = "p2p-share";
const STORE_NAME = "chunks";
const DB_VERSION = 1;

export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION
    );

    request.onupgradeneeded = () => {
      const db = request.result;

      if (
        !db.objectStoreNames.contains(
          STORE_NAME
        )
      ) {
        db.createObjectStore(
          STORE_NAME
        );
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveChunk(
  index: number,
  chunk: ArrayBuffer
) {
  const db = await openDB();

  return new Promise<void>(
    (resolve, reject) => {
      const tx = db.transaction(
        STORE_NAME,
        "readwrite"
      );

      const store =
        tx.objectStore(
          STORE_NAME
        );

      store.put(chunk, index);

      tx.oncomplete = () =>
        resolve();

      tx.onerror = () =>
        reject(tx.error);
    }
  );
}

export async function loadAllChunks() {
  const db = await openDB();

  return new Promise<
    ArrayBuffer[]
  >((resolve, reject) => {
    const tx = db.transaction(
      STORE_NAME,
      "readonly"
    );

    const store =
      tx.objectStore(
        STORE_NAME
      );

    const request =
      store.getAll();

    request.onsuccess = () => {
      resolve(
        request.result as ArrayBuffer[]
      );
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function clearChunks() {
  const db = await openDB();

  return new Promise<void>(
    (resolve, reject) => {
      const tx = db.transaction(
        STORE_NAME,
        "readwrite"
      );

      const store =
        tx.objectStore(
          STORE_NAME
        );

      const request =
        store.clear();

      request.onsuccess = () =>
        resolve();

      request.onerror = () =>
        reject(request.error);
    }
  );
}