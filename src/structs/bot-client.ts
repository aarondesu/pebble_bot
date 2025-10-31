import { Client, Partials } from "discord.js";
import { Logger } from "winston";
import { SupabaseClient } from "@supabase/supabase-js";
import { DataSource } from "typeorm";

import logger from "../libs/logger";
import supabaseClient from "../libs/supabase";
import type BotHandler from "./bot-handler";
import { getAccessToken } from "../libs/axios";

import { DISCORD_TOKEN } from "../config";

export default class BotClient extends Client {
  logger: Logger;

  supabaseClient: SupabaseClient;

  handlers: Record<string, BotHandler> = {};

  database: DataSource;

  constructor(database: DataSource) {
    super({
      intents: ["Guilds", "GuildMessages", "MessageContent", "GuildWebhooks"],
      partials: [Partials.Channel, Partials.Message, Partials.Reaction],
    });

    this.database = database;
    this.supabaseClient = supabaseClient;
    this.logger = logger;
  }

  async initialize() {
    this.logger.info("Initializing bot client....");

    // Load modules of handlers
    Object.values(this.handlers).forEach((handler) => {
      handler.loadModules();
    });

    return getAccessToken();
  }

  registerHandler(handler: BotHandler) {
    this.handlers[handler.id] = handler;
  }

  async start() {
    // Initialize all module handlers
    Object.values(this.handlers).forEach(async (handler: BotHandler) =>
      handler.initialize(),
    );

    this.logger.info("Logging in...");

    return this.login(DISCORD_TOKEN);
  }
}
