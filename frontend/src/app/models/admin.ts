export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalMovies: number;
  totalSeries: number;
  totalEpisodes: number;
  totalCredits: number;
  recentUsers: UserStats[];
  popularMovies: MovieStats[];
}

export interface UserStats {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: 'guest' | 'user' | 'admin';
  subscription_plan: 'free' | 'premium' | 'vip';
  credits: number;
  created_at: string;
}

export interface MovieStats {
  id: number;
  title: string;
  views: number;
}

export interface AdminUser {
  id: number;
  name: string;
  surname: string;
  email: string;
  password?: string; // Solo per creazione
  role: 'guest' | 'user' | 'admin';
  subscription_plan: 'free' | 'premium' | 'vip';
  credits: number;
  birth_date?: string;
  country_code?: string;
  region?: string;
  city?: string;
  address?: string;
  zip_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminMovie {
  id: number;
  title: string;
  movie_genre: string;
  description: string;
  director: string;
  release_year: number;
  duration: number;
  poster: string;
  youtube_link: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminSeries {
  id: number;
  title: string;
  series_genre: string;
  description: string;
  director: string;
  release_year: number;
  duration: number;
  poster: string;
  youtube_link: string;
  seasons: number;
  episodes: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}