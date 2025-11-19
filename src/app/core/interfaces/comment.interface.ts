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
  createdAt: Date;
  updatedAt: Date;
}