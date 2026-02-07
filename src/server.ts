import type { TelegramUpdate } from "./types";
import { handleStart, handleHelp, handleYtDownload, handleDefault } from "./commands";

type CommandHandler = (chatId: number, text: string) => Promise<void>;

const commands: Record<string, CommandHandler> = {
  "/start": handleStart,
  "/help": handleHelp,
  "/yt": handleYtDownload,
};

function parseCommand(text: string): string | null {
  const command = text.split(" ")[0] ?? "";
  return command in commands ? command : null;
}

Bun.serve({
  port: Number(process.env.PORT) || 3001,

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname !== "/telegram-webhook") {
      return new Response("Not Found", { status: 404 });
    }

    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const update = (await req.json()) as TelegramUpdate;

      if (!update.message) {
        return new Response("ok");
      }

      const chatId = update.message.chat.id;
      const text = update.message.text ?? "";

      const command = parseCommand(text);
      if (command) {
        await commands[command]!(chatId, text);
      } else {
        await handleDefault(chatId, text);
      }

      return new Response("ok");
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});
