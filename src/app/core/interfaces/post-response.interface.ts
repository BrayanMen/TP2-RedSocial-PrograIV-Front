import { IPost } from "./post.interface";

export interface IPostsResponse {
  data: IPost[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    nextPage: boolean;
    prevPage: boolean;
  };
}

export interface ICreatePostRequest {
  title: string;
  content: string;
  type?: string;
}

export enum SortBy {
  DATE = 'date',
  LIKES = 'likes',
}


export interface ILikeResponse {
  likesCount: number;
}