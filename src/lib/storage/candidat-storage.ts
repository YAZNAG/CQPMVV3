import { mkdir, readFile, writeFile, readdir } from "fs/promises";
import { join, basename } from "path";

function getStorageRoot(): string {
  return process.env.CANDIDAT_STORAGE_DIR ?? join(process.cwd(), "storage", "candidats");
}

function sanitizeReference(reference: string): string {
  const safe = basename(reference).replace(/[^A-Za-z0-9-_]/g, "");
  if (!safe) throw new Error("Référence de dossier invalide");
  return safe;
}

export function getCandidatDir(reference: string): string {
  return join(getStorageRoot(), sanitizeReference(reference));
}

export async function ensureCandidatDir(reference: string): Promise<string> {
  const dir = getCandidatDir(reference);
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function writeCandidatFile(
  reference: string,
  fileName: string,
  data: Buffer,
): Promise<string> {
  const dir = await ensureCandidatDir(reference);
  const safeName = basename(fileName);
  await writeFile(join(dir, safeName), data);
  return safeName;
}

export async function readCandidatFile(reference: string, fileName: string): Promise<Buffer> {
  const dir = getCandidatDir(reference);
  const safeName = basename(fileName);
  return readFile(join(dir, safeName));
}

export async function listCandidatFiles(reference: string): Promise<string[]> {
  try {
    const dir = getCandidatDir(reference);
    return await readdir(dir);
  } catch {
    return [];
  }
}
