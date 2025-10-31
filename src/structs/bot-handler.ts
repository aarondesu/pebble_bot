/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable n/global-require */
/* eslint-disable import-x/no-dynamic-require */
/* eslint-disable no-param-reassign */
/* eslint-disable n/no-sync */

import { EventEmitter } from "node:events";
import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import BotClient from "./bot-client";
import BotModule from "./bot-module";

interface BotHandlerOptions {
  id: string;
  client: BotClient;
  directory: string;
  classToHandle: typeof BotModule;
}

export default abstract class BotHandler extends EventEmitter {
  id: string;

  client: BotClient;

  directory: string;

  classToHandle: typeof BotModule | undefined;

  extensions: string[];

  modules: Record<string, BotModule> = {};

  constructor({ id, client, directory }: BotHandlerOptions) {
    super();

    this.id = id;
    this.client = client;
    this.directory = directory;
    this.extensions = [".js", ".ts", ".json"];
  }

  loadModules() {
    try {
      const moduleFiles = fs.readdirSync(this.directory).filter((file) => {
        const lastIndex = file.lastIndexOf(".");

        return (
          lastIndex !== -1 &&
          this.extensions.includes(file.substring(lastIndex))
        );
      });

      moduleFiles.forEach(async (file) => {
        const filePath = path.join(this.directory, file);

        const moduleFile = require(filePath);
        // If there is no export default on file, skip
        if (!moduleFile.default) {
          this.error(`Unable to find default exports on ${filePath}`);

          return;
        }

        const module = new moduleFile.default() as BotModule;
        if (this.classToHandle && !(module instanceof this.classToHandle)) {
          this.error(
            `Module ${filePath} is not an instance of ${this.classToHandle?.toString()}`,
          );

          return;
        }

        this.registerModule(module, filePath);
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(
          `${chalk.bgWhite.black(this.id)} Error loading module ${this.id}\n Reason: ${error.stack}`,
        );
      }
    }

    this.info(`Loaded ${Object.values(this.modules).length} modules`);
  }

  info(message: string) {
    this.client.logger.info(message, { source: this.id });
  }

  error(error: string) {
    this.client.logger.error(`${chalk.bgWhite.black(this.id)} ${error}`);
  }

  registerModule(module: BotModule, filepath: string): BotModule | undefined {
    if (this.modules[module.id]) {
      this.client.logger.error(
        `${chalk.bgWhite.black(this.id)} Module with ID ${module.id} is already registered.`,
      );
      return undefined;
    }

    module.handler = this;
    module.client = this.client;
    module.filePath = filepath;

    this.modules[module.id] = module;

    return module;
  }

  /**
   * ABstract functions to be called
   */
  abstract initialize(): void;
}
