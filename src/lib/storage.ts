import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const maximumBytes = 10 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

export async function saveUpload(file: File) {
  if (!allowedTypes.has(file.type)) throw new Error('Unsupported file type.');
  if (!file.size || file.size > maximumBytes) throw new Error('File must be between 1 byte and 10 MB.');
  const root = path.resolve(process.env.LOCAL_STORAGE_PATH ?? path.join(process.cwd(), 'storage', 'uploads'));
  const extension = file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|pdf)$/)?.[1] ?? 'bin';
  const filename = `${randomUUID()}.${extension}`; const target = path.join(root, filename);
  if (!target.startsWith(`${root}${path.sep}`)) throw new Error('Invalid storage path.');
  await mkdir(root, { recursive: true }); await writeFile(target, Buffer.from(await file.arrayBuffer()));
  return { key: filename, contentType: file.type, size: file.size };
}
