export interface IPost {
  id: string;
  author: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  title: string;
  content: string;
  image?: string;
  type: string;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  isLikedByMe: boolean;
  isRepostedByMe: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum PostType {
  TRAINING = 'Entrenamiento',
  TECHNIQUE = 'Técnica',
  ADVICE = 'Consejo',
  COMPETITION = 'Competencia',
  MOTIVATION = 'Motivación',
  GENERAL = 'General',
}

