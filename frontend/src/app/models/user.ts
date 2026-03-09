export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: 'guest' | 'user' | 'admin';
  subscription_plan?: 'free' | 'premium' | 'vip';
  credits?: number;
  created_at?: string;
  updated_at?: string;
}