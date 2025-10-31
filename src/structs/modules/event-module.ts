import BotModule from "../bot-module";

declare type ListenerType = "on" | "once";

interface EventModuleOptions {
  emitter: string;
  event: string;
  type?: ListenerType;
}

export default abstract class EventModule extends BotModule {
  emitter: string;

  event: string;

  type: ListenerType;

  constructor(
    id: string,
    options: EventModuleOptions = {
      emitter: "null",
      event: "on",
    },
  ) {
    super(id);

    this.emitter = options?.emitter;
    this.event = options?.event;
    this.type = options?.type || "on";
  }

  abstract execute(...args: any[]): void;
}
