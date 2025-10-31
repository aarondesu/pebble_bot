import { CronJob, validateCronExpression } from "cron";
import BotClient from "../bot-client";
import BotHandler from "../bot-handler";
import CronJobModule from "../modules/cronjob-module";

export default class CronJobHandler extends BotHandler {
  constructor(client: BotClient, directory: string) {
    super({
      id: "cronjob-handler",
      client,
      directory,
      classToHandle: CronJobModule,
    });
  }

  initialize(): void {
    const jobModules = Object.values(this.modules);

    this.info(`Initializing ${jobModules.length} cron-job modules...`);

    try {
      jobModules.forEach((module) => {
        const cronjob = module as CronJobModule;
        cronjob.initialize();

        if (validateCronExpression(cronjob.schedule).valid) {
          cronjob.task = new CronJob(
            cronjob.schedule,
            () => cronjob.execute(),
            null,
            false,
          );

          cronjob.task?.start();
        } else {
          this.client.logger.error(
            "Invalid cron job schedule. Please refer to the cron documentation for the correct format https://www.npmjs.com/package/cron",
          );
        }
      });
    } catch (error) {
      this.error(error as string);
    }
  }
}
