import EventEmitter from "node:events";
import { Collection } from "discord.js";

import BotClient from "../bot-client";
import BotHandler from "../bot-handler";
import EventModule from "../modules/event-module";

export default class EventHandler extends BotHandler {
  emitters: Collection<string, EventEmitter>;

  constructor(client: BotClient, directory: string) {
    super({
      id: "event-handler",
      client,
      classToHandle: EventModule,
      directory,
    });

    this.emitters = new Collection<string, EventEmitter>();
    this.emitters.set("client", this.client);

    this.setHandlerAsEmitter(this);
  }

  addToEmitter(event: EventModule) {
    const emitter = this.emitters.get(event.emitter);
    if (!emitter) throw new Error(`Emitter ${event.emitter} does not exist!`);

    const boundExec = event.execute.bind(event);

    if (event.type === "once") {
      emitter.once(event.event, () => boundExec);
      return event;
    }

    emitter.on(event.event, boundExec);
    return event;
  }

  setHandlerAsEmitter(handler: BotHandler) {
    this.emitters.set(handler.id, handler);
  }

  initialize(): void {
    const modules = Object.values(this.modules);

    this.info(`${modules.length} events to be loaded`);
    modules.forEach((moduleFile) => {
      this.addToEmitter(moduleFile as EventModule);
    });
  }
}
