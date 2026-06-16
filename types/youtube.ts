export interface VideoThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface VideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    default: VideoThumbnail;
    medium: VideoThumbnail;
    high: VideoThumbnail;
    standard?: VideoThumbnail;
    maxres?: VideoThumbnail;
  };
  channelTitle: string;
  categoryId: string;
  tags?: string[];
  defaultLanguage?: string;
}

export interface VideoStatistics {
  viewCount: string;
  likeCount: string;
  commentCount: string;
  favoriteCount: string;
}

export interface VideoContentDetails {
  duration: string;
  dimension: string;
  definition: string;
}

export interface Video {
  id: string;
  snippet: VideoSnippet;
  statistics: VideoStatistics;
  contentDetails: VideoContentDetails;
  rank?: number;
}

export interface CommentSnippet {
  videoId: string;
  textDisplay: string;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  likeCount: number;
  publishedAt: string;
  updatedAt: string;
  totalReplyCount?: number;
}

export interface Comment {
  id: string;
  snippet: {
    topLevelComment: {
      id: string;
      snippet: CommentSnippet;
    };
    totalReplyCount: number;
  };
}

export interface VideoCategory {
  id: string;
  snippet: {
    title: string;
    assignable: boolean;
  };
}

export interface TrendingResponse {
  videos: Video[];
  nextPageToken?: string;
  totalResults: number;
}

export interface CommentsResponse {
  comments: Comment[];
  nextPageToken?: string;
  totalResults: number;
}

export interface CategoriesResponse {
  categories: VideoCategory[];
}

export type CountryCode = string;

export interface Country {
  code: CountryCode;
  name: string;
  flag: string;
}

export type EducationStrategy = 'trending' | 'search' | 'filtered' | 'none';

export interface EducationMeta {
  strategy: EducationStrategy;
  strategyLabel: string;
  quota: number;
  warning?: string;
}
