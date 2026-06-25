import {
  type AuthenticationCreds,
  type AuthenticationState,
  BufferJSON,
  initAuthCreds,
  proto,
  type SignalDataTypeMap,
} from "baileys";
import { mkdir, readdir, readFile, stat, unlink, writeFile } from "fs/promises";
import { join } from "path";

const FLUSH_INTERVAL_MS = 300;
const FLUSH_ON_EXIT = true;

const cache = new Map<string, unknown>();
const dirty = new Set<string>();
const absent = new Set<string>();

let flushTimer: ReturnType<typeof setTimeout> | null = null;

function schedulFlush(folder: string) {
  if (flushTimer) {
    return;
  }
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushDirty(folder);
  }, FLUSH_INTERVAL_MS);
}

async function flushDirty(folder: string) {
  if (!dirty.size) {
    return;
  }
  const toWrite = [...dirty];
  dirty.clear();

  await Promise.all(
    toWrite.map(async (key) => {
      const filePath = join(folder, key);
      const value = cache.get(key);
      if (value === undefined) {
        return;
      }
      try {
        await writeFile(filePath, JSON.stringify(value, BufferJSON.replacer), "utf-8");
      } catch {
        dirty.add(key);
      }
    }),
  );
}

const sanitize = (file: string) => file.replace(/\//g, "__").replace(/:/g, "-");

function cacheSet(key: string, value: unknown, folder: string) {
  absent.delete(key);
  cache.set(key, value);
  dirty.add(key);
  schedulFlush(folder);
}

async function cacheDelete(key: string, folder: string) {
  cache.delete(key);
  dirty.delete(key);
  absent.add(key);
  try {
    await unlink(join(folder, key));
  } catch {
    // catch
  }
}

export const authState = async (
  folder: string,
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> => {
  const folderInfo = await stat(folder).catch(() => null);
  if (folderInfo) {
    if (!folderInfo.isDirectory()) {
      throw new Error(
        `Found something that is not a directory at ${folder}. ` +
          "Delete it or specify a different location.",
      );
    }
  } else {
    await mkdir(folder, { recursive: true });
  }

  const entries = await readdir(folder).catch(() => [] as string[]);
  await Promise.all(
    entries.map(async (filename) => {
      try {
        const raw = await readFile(join(folder, filename), "utf-8");
        cache.set(filename, JSON.parse(raw, BufferJSON.reviver));
      } catch {
        // catch
      }
    }),
  );

  if (FLUSH_ON_EXIT) {
    const onExit = () => flushDirty(folder);
    process.once("beforeExit", onExit);
    process.once("SIGINT", onExit);
    process.once("SIGTERM", onExit);
  }

  const readData = (file: string): unknown => {
    const key = sanitize(file);
    if (absent.has(key)) {
      return null;
    }
    return cache.get(key) ?? null;
  };

  const writeData = (data: unknown, file: string) => {
    cacheSet(sanitize(file), data, folder);
  };

  const removeData = (file: string) => {
    return cacheDelete(sanitize(file), folder);
  };

  const creds: AuthenticationCreds =
    (readData("creds.json") as AuthenticationCreds) ?? initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [id: string]: SignalDataTypeMap[typeof type] } = {};
          for (const id of ids) {
            let value = readData(`${type}-${id}.json`) as SignalDataTypeMap[typeof type];
            if (type === "app-state-sync-key" && value) {
              value = proto.Message.AppStateSyncKeyData.fromObject(
                value as unknown as { [k: string]: unknown },
              ) as unknown as SignalDataTypeMap[typeof type];
            }
            data[id] = value;
          }
          return data;
        },

        set: async (data) => {
          const removes: Promise<void>[] = [];
          for (const category in data) {
            const cat = category as keyof SignalDataTypeMap;
            for (const id in data[cat]) {
              const catData = data[cat];
              if (!catData) {
                continue;
              }
              const value = catData[id];
              const file = `${category}-${id}.json`;
              if (value) {
                writeData(value, file);
              } else {
                removes.push(removeData(file));
              }
            }
          }
          if (removes.length) {
            await Promise.all(removes);
          }
        },
      },
    },

    saveCreds: async () => {
      writeData(creds, "creds.json");
      if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
      }
      await flushDirty(folder);
    },
  };
};
