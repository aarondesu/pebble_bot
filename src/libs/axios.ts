import axios from "axios";
import {
  REDDIT_USERNAME,
  REDDIT_PASSWORD,
  REDDIT_CLIENT_ID,
  REDDIT_SECRET_KEY,
} from "../config";
import logger from "./logger";

const client = axios.create({
  headers: {
    "User-Agent": "BaguioDiscordBot/0.1 by nonodesushin",
  },
});

interface GetAccessTokenResults {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export async function getAccessToken() {
  // Get access token from reddit
  logger.info("Requesting access token from reddit...");
  const result = await axios.post<GetAccessTokenResults>(
    "https://www.reddit.com/api/v1/access_token",
    {
      grant_type: "password",
      username: REDDIT_USERNAME,
      password: REDDIT_PASSWORD,
    },
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_SECRET_KEY}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  if (result.status === 200) {
    logger.info("Successfully requested token!");

    client.defaults.headers.common.Authorization = `bearer ${result.data.access_token}`;
  }
}

export default client;
