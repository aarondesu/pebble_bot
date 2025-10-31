import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import BotModule from "../bot-module";

interface CommandModuleOptions {
  alias: string;
  description: string;
}

export default abstract class CommandModule extends BotModule {
  data: SlashCommandBuilder;

  constructor(id: string, options?: CommandModuleOptions) {
    super(id);

    this.data = new SlashCommandBuilder()
      .setName(options?.alias || this.id)
      .setDescription(options?.description || "A Command");
  }

  setDescription(desription: string) {
    this.data.setDescription(desription);
  }

  abstract execute(_interaction: ChatInputCommandInteraction): Promise<void>;
}
