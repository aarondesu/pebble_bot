import type BotClient from "./bot-client";
import type BotHandler from "./bot-handler";

export default abstract class BotModule {
  id: string;

  client: BotClient | null;

  handler: BotHandler | null;

  filePath: string;

  constructor(id: string) {
    this.id = id;
    this.filePath = "";
    this.client = null;
    this.handler = null;
  }
}
