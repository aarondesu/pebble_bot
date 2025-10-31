import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
  WebhookClient,
} from "discord.js";
import { Repository } from "typeorm";
import RedditWebhook from "../entities/reddit-webhook";

import CommandModule from "../structs/modules/command-module";
import { getRedditPost } from "../libs/reddit";

const subredditLiteral = /r\/([a-zA-Z0-9_]+)\/?(?:hot|new|top)?/;

export default class RedditCommand extends CommandModule {
  webhookClient: WebhookClient;

  redditWebhookRepository: Repository<RedditWebhook> | undefined;

  constructor() {
    super("reddit", {
      alias: "reddit",
      description:
        "A command to initialize reddit feed into the channel. Will create a webhook",
    });

    this.data
      .addSubcommand((subcommand) =>
        subcommand
          .setName("init")
          .setDescription("Initializes the reddit feed feature on this channel")
          .addStringOption((option) =>
            option
              .setName("subreddit")
              .setDescription("The subreddit to be used")
              .setRequired(true),
          )
          .addStringOption((option) =>
            option
              .setName("webhook_name")
              .setDescription("The name of the webhook, must be unique")
              .setRequired(true),
          ),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("remove")
          .setDescription("Removes the webhook integration")
          .addStringOption((option) =>
            option
              .setName("webhook_name")
              .setDescription("The name of the webhook")
              .setRequired(true),
          ),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("clear")
          .setDescription("Removes all webhook integration from this channel"),
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

    this.webhookClient = new WebhookClient({
      url: "https://discord.com/api/webhooks/1431620235521163376/4Ny5qk-qXmbIQuyxxV9exXEp_0V5HGxd4I_1YjkdiwOS8AYAGpYdXe3DUWE86mY9nwVi",
    });

    this.redditWebhookRepository =
      this.client?.database.getRepository<RedditWebhook>(RedditWebhook);
  }

  async execute(interaction: ChatInputCommandInteraction) {
    switch (interaction.options.getSubcommand()) {
      case "init":
        await this.initializeFeature(interaction);
        break;

      case "remove":
        await this.removeFeature(interaction);
        break;
      case "clear":
        await this.clearFeatures(interaction);
        break;
      default:
        await interaction.reply("Unkown command entered");
        break;
    }
  }

  /**
   * Initializes the feature, creates a webhook on the channel
   * @param interaction
   */
  async initializeFeature(interaction: ChatInputCommandInteraction) {
    // Get options
    const webhookName = interaction.options.getString("webhook_name") as string;
    const subreddit = interaction.options.getString("subreddit") as string;

    // Defer the reply
    await interaction.deferReply();

    // Test the reddit link
    if (!subredditLiteral.test(subreddit)) {
      interaction.editReply(
        "Must be a proper subreddit. eg. r/Ask, r/sports/hot",
      );
    } else {
      const webhookRepo =
        this.client?.database.getRepository<RedditWebhook>(RedditWebhook);

      // Create the webhookurl
      if (interaction.channel instanceof TextChannel) {
        // Check if webhook already exists on the channel
        const exists = await webhookRepo?.exists({
          where: {
            name: webhookName,
          },
        });

        if (exists) {
          await interaction.editReply(
            "Feature already activated on this channel",
          );
        } else {
          // Get reddit details
          const subredditDetails = await getRedditPost(subreddit);
          if (!subredditDetails) return;

          const clnUrl = new URL(subredditDetails?.sr_detail.community_icon);
          clnUrl.search = "";

          interaction.channel
            .createWebhook({
              name: webhookName,
              avatar: clnUrl.toString(),
            })
            .then(async (webhook) => {
              const redditWebhook = new RedditWebhook();
              redditWebhook.webhookUrl = webhook.url;
              redditWebhook.subreddit = subreddit;
              redditWebhook.name = webhookName;
              redditWebhook.webhookId = webhook.id;
              redditWebhook.clientId = this.client?.user?.id ?? "";
              redditWebhook.channelId = interaction.channelId;
              redditWebhook.save();

              interaction.editReply(
                "Successfully initialized the reddit feature. Future posts from the subreddit will be posted on this channel.",
              );
            })
            .catch((error) => this.client?.logger.error(error));
        }
      }
    }
  }

  /**
   * REmoves the feature given the name
   * @param interaction
   */
  async removeFeature(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    // Get variables
    const webhookName = interaction.options.getString("webhook_name") as string;

    const webhookRepo =
      this.client?.database.getRepository<RedditWebhook>(RedditWebhook);

    // Check if exists
    const exists = await webhookRepo?.existsBy({ name: webhookName });
    if (exists) {
      const webhook = await webhookRepo?.findOneBy({ name: webhookName });
      const webhookClient = new WebhookClient({
        url: webhook?.webhookUrl as string,
      });

      await webhookClient.delete();
      await webhook?.remove();

      await interaction.editReply(
        "Successfully removed feature. Any future reddit posts will not be posted on this channel",
      );
    } else {
      await interaction.editReply("Webhook does not exist.");
    }
  }

  async clearFeatures(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    if (interaction.channel instanceof TextChannel) {
      const webhookRepo =
        this.client?.database.getRepository<RedditWebhook>(RedditWebhook);

      const webhooks = await webhookRepo?.findBy({
        channelId: interaction.channel.id,
      });

      // Remove webhook data from db
      webhooks?.forEach((webhook) => {
        const client = new WebhookClient({ url: webhook.webhookUrl });

        client.delete();
        webhook.remove();
      });

      await interaction.editReply(
        "Successfully removed all managed webhooks on this channel!",
      );
    }
  }
}
