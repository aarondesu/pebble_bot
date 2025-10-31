import path from "node:path";
import BotClient from "./structs/bot-client";
import CommandHandler from "./structs/handlers/command-handler";
import EventHandler from "./structs/handlers/event-handler";
import CronJobHandler from "./structs/handlers/cronjob-handler";

import connectDB from "./database";
import logger from "./libs/logger";

connectDB()
  .initialize()
  .then((database) => {
    const app = new BotClient(database);

    const commandHandler = new CommandHandler(
      app,
      path.resolve(__dirname, "commands"),
    );
    const eventHandler = new EventHandler(
      app,
      path.resolve(__dirname, "events"),
    );
    const cronJobHandler = new CronJobHandler(
      app,
      path.resolve(__dirname, "jobs"),
    );

    app.registerHandler(commandHandler);
    app.registerHandler(eventHandler);
    app.registerHandler(cronJobHandler);

    logger.info("Connection to the dataabase succesfull");

    app
      .initialize()
      .then(() => {
        app.start().catch((error) => {
          app.logger.error(error);
        });
      })
      .catch((error) => logger.error(error));
  })
  .catch((error) => logger.error(error));
