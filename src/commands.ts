import { sendMessage, sendDocument } from "./telegram";
import { searchFiles, downloadFile } from "./gdrive";
import { join } from "path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "os";

export async function handleStart(chatId: number): Promise<void> {
  await sendMessage(chatId, "Welcome to Bun Telegram Bot 🚀");
}

export async function handleHelp(chatId: number): Promise<void> {
  await sendMessage(
    chatId,
    "Commands:\n/start - Start the bot\n/help - Show this help\n/yt <url> - Download a YouTube video\n/<keyword> - Search & send matching files from Google Drive",
  );
}

export async function handleYtDownload(
  chatId: number,
  text: string,
): Promise<void> {
  const url = text.replace("/yt", "").trim();

  if (!url) {
    await sendMessage(
      chatId,
      "Please provide a YouTube URL.\nUsage: /yt <url>",
    );
    return;
  }

  await sendMessage(chatId, "Downloading... please wait.");

  const tempDir = await mkdtemp(join(tmpdir(), "yt-"));

  try {
    const outputTemplate = `${tempDir}/%(title)s.%(ext)s`;
    const cookiesPath = join(import.meta.dir, "..", "cookies.txt");
    const cookiesFile = Bun.file(cookiesPath);
    const cookiesArgs = (await cookiesFile.exists())
      ? ["--cookies", cookiesPath]
      : [];
    await Bun.$`yt-dlp ${cookiesArgs} -f ${"bestvideo+bestaudio/best"} --merge-output-format mp4 -o ${outputTemplate} ${url}`;

    const glob = new Bun.Glob("*");
    const files = await Array.fromAsync(glob.scan(tempDir));
    const fileName = files[0];

    if (!fileName) {
      await sendMessage(chatId, "Download failed: no file was created.");
      return;
    }

    const filePath = join(tempDir, fileName);
    await sendDocument(chatId, filePath, "Here's your download!");
  } catch (error) {
    console.error("YT download error:", error);
    await sendMessage(chatId, `Download failed: ${error}`);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export async function handleDriveSearch(
  chatId: number,
  text: string,
): Promise<void> {
  const query = text.split(" ")[0]!.replace("@", "").trim();

  if (!query) {
    await sendMessage(
      chatId,
      "Please provide a search term.\nUsage: /<keyword>",
    );
    return;
  }

  await sendMessage(chatId, `Searching Drive for "${query}"...`);

  const tempDir = await mkdtemp(join(tmpdir(), "gdrive-"));

  try {
    const files = await searchFiles(query);

    if (files.length === 0) {
      await sendMessage(chatId, `No files found matching "${query}".`);
      return;
    }

    for (const file of files) {
      try {
        const filePath = await downloadFile(file.id, file.name, tempDir);
        await sendDocument(chatId, filePath, file.name);
      } catch (error) {
        console.error(`Failed to send file ${file.name}:`, error);
        await sendMessage(chatId, `Failed to send "${file.name}": ${error}`);
      }
    }
  } catch (error) {
    console.error("Drive search error:", error);
    await sendMessage(chatId, `Drive search failed: ${error}`);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export async function handleDefault(
  chatId: number,
  text: string,
): Promise<void> {
  const apiResponse = await callAPI(text);
  await sendMessage(chatId, apiResponse);
}

async function callAPI(input: string): Promise<string> {
  // 🔥 Replace with real API call
  console.log("Calling your API with input:", input);
  return `You said: ${input}`;
}
