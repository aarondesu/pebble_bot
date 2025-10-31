import { Events } from "discord.js";
import EventModule from "../structs/modules/event-module";

export default class ClientReadyEvent extends EventModule {
  constructor() {
    super("client-ready", {
      emitter: "client",
      event: Events.ClientReady,
    });
  }

  execute(): void {
    this.client?.logger.info(`Logged in as user ${this.client.user?.username}`);
  }
}
