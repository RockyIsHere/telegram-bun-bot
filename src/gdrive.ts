import { join } from "path";

const GOOGLE_API_KEY = Bun.env.GOOGLE_API_KEY!;
const DRIVE_FOLDER_ID = Bun.env.DRIVE_FOLDER_ID!;

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export async function searchFiles(query: string): Promise<DriveFile[]> {
  const q = `'${DRIVE_FOLDER_ID}' in parents and name contains '${query}' and trashed = false`;
  const params = new URLSearchParams({
    q,
    key: GOOGLE_API_KEY,
    fields: "files(id,name,mimeType)",
    pageSize: "20",
  });

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params}`,
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Drive API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { files: DriveFile[] };
  return data.files ?? [];
}

export async function downloadFile(
  fileId: string,
  fileName: string,
  destDir: string,
): Promise<string> {
  const params = new URLSearchParams({
    alt: "media",
    key: GOOGLE_API_KEY,
  });

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?${params}`,
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Drive download error: ${res.status} ${err}`);
  }

  const filePath = join(destDir, fileName);
  await Bun.write(filePath, res);
  return filePath;
}
