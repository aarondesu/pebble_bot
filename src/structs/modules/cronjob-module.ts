import { CronJob } from "cron";

import BotModule from "../bot-module";

interface CronJobOptions {
  schedule: string;
}

export default abstract class CronJobModule extends BotModule {
  schedule: string;

  task?: CronJob;

  constructor(id: string, options?: CronJobOptions) {
    super(id);

    this.schedule = options?.schedule || "";
  }

  abstract initialize(): void;
  abstract execute(): void;
}
