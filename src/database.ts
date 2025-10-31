import { DataSource } from "typeorm";

import RedditWebhook from "./entities/reddit-webhook";
import { DATABASE_URI } from "./config";

export default function connectDB() {
  return new DataSource({
    type: "postgres",
    url: DATABASE_URI,
    synchronize: true,
    entities: [RedditWebhook],
  });
}
