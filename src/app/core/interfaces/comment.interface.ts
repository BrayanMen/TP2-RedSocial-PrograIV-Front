export interface IComment {
  id: string;
  postId: string;
  author: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  content: string;
  isModified: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICreateCommentRequest {
  content: string;
}

export interface IUpdateCommentRequest {
  content: string;
}

export interface ICommentsResponse {
  data: IComment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    nextPage: boolean;
    prevPage: boolean;
  };
}
