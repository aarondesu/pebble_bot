import { ChatInputCommandInteraction } from "discord.js";
import CommandModule from "../structs/modules/command-module";

export default class Ping extends CommandModule {
  constructor() {
    super("ping");

    this.client?.logger.info("Test");
  }

  // eslint-disable-next-line class-methods-use-this
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply("Pong!");
  }
}
