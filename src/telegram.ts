const BOT_TOKEN = process.env.BOT_TOKEN!;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export async function sendMessage(chatId: number, text: string): Promise<void> {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });
}

export async function sendDocument(chatId: number, filePath: string, caption?: string): Promise<void> {
  const file = Bun.file(filePath);
  const formData = new FormData();
  formData.append("chat_id", String(chatId));
  formData.append("document", file);
  if (caption) {
    formData.append("caption", caption);
  }

  await fetch(`${TELEGRAM_API}/sendDocument`, {
    method: "POST",
    body: formData,
  });
}
