import "dotenv/config";

export const NODE_ENV = process.env.NODE_ENV as "production" | "development";

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN as string;
export const DEV_GUILD_ID = process.env.DEV_GUILD_ID as string;

export const SUPABASE_URL = process.env.SUPABASE_URL as string;
export const SUPABASE_KEY = process.env.SUPABASE_KEY as string;

export const DATABASE_URI = process.env.DATABASE_URI as string;

export const REDDIT_SECRET_KEY = process.env.REDDIT_SECRET_KEY as string;
export const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID as string;
export const REDDIT_USERNAME = process.env.REDDIT_USERNAME as string;
export const REDDIT_PASSWORD = process.env.REDDIT_PASSWORD as string;
