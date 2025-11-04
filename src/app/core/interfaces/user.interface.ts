export interface IUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: Date;
  age: number;
  bio: string;
  profileImage?: string;
  role: UserRole;
  principalMartialArt?: string;
  principalMartialLevel?: string;
  principalBeltLevel?: string;
  fighterLevel?: string;
  martialArts: IMartialArtInfo[];
  socialLinks?: ISocialLinks;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMartialArtInfo {
  martialArt: string;
  martialLevel: string;
  beltLevel?: string;
  yearsPractice?: number;
}

export interface ISocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}