import axios, { getAccessToken } from "./axios";
import logger from "./logger";

interface RedditChild {
  data: RedditPost;
}

interface RedditResult {
  data: {
    children: RedditChild[];
  };
}

interface RedditImageSource {
  url: string;
  width: number;
  height: number;
}

interface RedditImagePreview {
  id: string;
  source: RedditImageSource;
  resolutions: RedditImageSource[];
}

export interface RedditPost {
  id: string;
  title: string;
  permalink: string;
  author: string;
  is_reddit_media_doman: boolean;
  is_gallery: boolean;
  url: string;
  subreddit_name_prefixed: string;
  selftext: string;
  sr_detail: SubredditDetail;
  preview: {
    images: RedditImagePreview[];
  };
  isVideo: boolean;
}

export interface SubredditDetail {
  community_icon: string;
}

export async function getSubreditDetails(subreddit: string) {
  try {
    const result = await axios.get<RedditResult>(
      `https://oauth.reddit.com/${subreddit}.json?raw_json=1&limit=10&sr_detail=1`,
    );

    // Check if 401, try and get another access token
    if ([401, 403].includes(result.status)) {
      await getAccessToken();
    }

    const post = result.data.data.children[0].data;

    return post;
  } catch (error) {
    logger.error(error);

    return undefined;
  }
}

export async function getRedditPost(subreddit: string) {
  try {
    const result = await axios.get<RedditResult>(
      `https://oauth.reddit.com/${subreddit}.json?raw_json=1&limit=10&sr_detail=1`,
    );

    // Check if 401, try and get another access token
    if ([401, 403].includes(result.status)) {
      await getAccessToken();
    }

    const post = result.data.data.children[0].data;

    return post;
  } catch (error) {
    logger.error(error);

    return undefined;
  }
}
