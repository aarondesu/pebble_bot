import {
  Events,
  SlashCommandBuilder,
  REST,
  Routes,
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPutAPIApplicationGuildCommandsResult,
  Interaction,
  ChatInputCommandInteraction,
} from "discord.js";
import type BotClient from "../bot-client";
import BotHandler from "../bot-handler";
import CommandModule from "../modules/command-module";

import { DISCORD_TOKEN } from "../../config";

export default class CommandHandler extends BotHandler {
  commands: SlashCommandBuilder[] = [];

  constructor(client: BotClient, directory: string) {
    super({
      id: "command-handler",
      directory,
      client,
      classToHandle: CommandModule,
    });
  }

  async initialize(): Promise<void> {
    // Setup interaction listener
    this.client.once(Events.ClientReady, async () => this.setupCommands());
    this.client.once(Events.GuildCreate, async (guild) =>
      this.addCommandsToGuild(guild.id),
    );

    this.client.on(Events.InteractionCreate, async (interaction) =>
      this.handleCommands(interaction),
    );
  }

  /**
   * Setup commands into existing server. Will transition into global commands once the scope of the bot increases.
   */
  async setupCommands() {
    // Setup variables
    const clientId = this.client.user?.id;

    // Setup commands array
    this.info(
      `${Object.values(this.modules).length} commands to be loaded into existing guilds`,
    );

    const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

    Object.values(this.modules).forEach((command) => {
      commands.push((command as CommandModule).data.toJSON());
    });

    const rest = new REST({ version: "9" }).setToken(DISCORD_TOKEN);

    try {
      this.info("Started refreshing application (/) commands.");

      // Clear all global commands
      if (clientId) {
        // Add commands to joined servers
        this.client.guilds.cache.forEach(async (guild) => {
          (await rest.put(Routes.applicationGuildCommands(clientId, guild.id), {
            body: commands,
          })) as RESTPutAPIApplicationGuildCommandsResult;
        });

        this.info(`Successfully reloaded commands`);
      }
    } catch (error) {
      if (error instanceof Error) {
        this.error(`Error while registering commands: ${error}`);
      }
    }
  }

  /**
   * Adds the commands to a server
   * @param guildId
   */
  async addCommandsToGuild(guildId: string) {
    try {
      // Setup variables
      const clientId = this.client.user?.id;

      const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

      Object.values(this.modules).forEach((command) => {
        commands.push((command as CommandModule).data.toJSON());
      });

      const rest = new REST({ version: "9" }).setToken(DISCORD_TOKEN);

      if (clientId)
        (await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
          body: commands,
        })) as RESTPutAPIApplicationGuildCommandsResult;
    } catch (error) {
      this.error(error as string);
    }
  }

  /**
   * Handles slash command interaction
   * @param interaction
   * @returns
   */
  async handleCommands(interaction: Interaction) {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;
    const command = this.modules[commandName] as CommandModule;

    if (!command) {
      await (interaction as ChatInputCommandInteraction).reply(
        `Failed to use command ${commandName}`,
      );
    }

    if (!interaction.inGuild()) return;

    await command.execute(interaction as ChatInputCommandInteraction);
  }
}
