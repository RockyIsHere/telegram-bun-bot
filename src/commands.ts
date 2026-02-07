import { sendMessage, sendDocument } from "./telegram";
import { join } from "path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "os";

export async function handleStart(chatId: number): Promise<void> {
  await sendMessage(chatId, "Welcome to Bun Telegram Bot 🚀");
}

export async function handleHelp(chatId: number): Promise<void> {
  await sendMessage(
    chatId,
    "Commands:\n/start - Start the bot\n/help - Show this help\n/yt-download <url> - Download a YouTube video",
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
    await Bun.$`yt-dlp -f ${"bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best[height<=480]"} --merge-output-format mp4 -o ${outputTemplate} ${url}`;

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
