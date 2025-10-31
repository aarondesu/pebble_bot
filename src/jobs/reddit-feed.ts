import { EmbedBuilder, WebhookClient } from "discord.js";

import CronJobModule from "../structs/modules/cronjob-module";
import RedditWebhook from "../entities/reddit-webhook";

import { getRedditPost } from "../libs/reddit";

export default class RedditFeedJob extends CronJobModule {
  redditWebhooks: RedditWebhook[] = [];

  subreddits: Record<string, string> = {};

  webhookClients: WebhookClient[] = [];

  constructor() {
    super("reddit-feed", {
      schedule: "* * * * *",
    });
  }

  /**
   * Initialize the crojob, get all webhooks from the database
   */
  async initialize() {
    // Get repo
    const webhookRepo = this.client?.database.getRepository(RedditWebhook);

    const webhooks: RedditWebhook[] = (await webhookRepo?.findBy({
      clientId: this.client?.user?.id,
    })) as RedditWebhook[];
    if (webhooks.length !== 0) {
      this.webhookClients = webhooks.map((webhook) => {
        const client = new WebhookClient({ url: webhook.webhookUrl });

        this.subreddits[client.id] = webhook.subreddit;

        return client;
      });
    }
  }

  /**
   * Execute the cron job task
   */
  async execute() {
    this.client?.logger.info("Running Reddit Feed Job Task");

    // Get repo
    const webhookRepo = this.client?.database.getRepository(RedditWebhook);

    // Get list from database, if have new entry create new webhookClient list
    const webhooks: RedditWebhook[] = (await webhookRepo?.findBy({
      clientId: this.client?.user?.id,
    })) as RedditWebhook[];
    if (webhooks.length !== this.webhookClients.length) {
      this.webhookClients = [];

      this.webhookClients = webhooks.map((webhook) => {
        const client = new WebhookClient({ url: webhook.webhookUrl });

        this.subreddits[client.id] = webhook.subreddit;

        return client;
      });
    }

    this.webhookClients.forEach(async (client) => {
      const redditPost = await getRedditPost(this.subreddits[client.id]);
      if (!redditPost) return;

      // Check if if latest, if it is send post to webhook
      const webhook = webhooks.find((w) => w.webhookId === client.id);
      if (webhook && webhook.latestPostId === redditPost.id) {
        return;
      }

      if (webhook) {
        webhook.latestPostId = redditPost.id;
        webhook.save();
      }

      const redditEmbed = new EmbedBuilder()
        .setTitle(redditPost.title)
        .setURL(`https://wwww.reddit.com/${redditPost.permalink}`)
        .setAuthor({
          name: redditPost.author,
          url: `https://wwww.reddit.com/u/${redditPost.author}`,
        })
        .setTimestamp()
        .setFooter({ text: redditPost.subreddit_name_prefixed })
        .setColor("Blue");

      if (redditPost.selftext.length > 0) {
        redditEmbed.setDescription(redditPost.selftext);
      }

      if (redditPost.is_reddit_media_doman) {
        redditEmbed.setImage(redditPost.url);
      } else if (redditPost.is_gallery) {
        redditEmbed.setDescription(redditPost.url);
      }

      if (redditPost.isVideo) {
        // Get 640 thumnail
        const imgSrc = redditPost.preview.images[0].resolutions.find(
          (res) => res.width === 640,
        ); // Get the first image then get preview

        // Get clean url
        if (!imgSrc) return;
        const clnUrl = new URL(imgSrc.url);
        clnUrl.search = "";

        if (imgSrc) redditEmbed.setImage(clnUrl.toString());
      }

      await client.send({ embeds: [redditEmbed] });
    });
  }
}
