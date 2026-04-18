export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserOut {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

export interface MemberOut {
  user_id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  joined_at: string;
}

export interface TeamOut {
  id: number;
  name: string;
  owner_id: number;
  members: MemberOut[];
  created_at: string;
}

export interface BrandOut {
  id: number;
  brand_name: string;
  industry: string | null;
  tone_of_voice: string | null;
  target_audience: string | null;
  value_proposition: string | null;
  positioning: string | null;
  user_id: number;
  created_at: string;
  updated_at: string | null;
}

export interface StrategyOut {
  id: number;
  title: string;
  objectives: string | null;
  messaging_themes: string | null;
  platform_focus: string | null;
  status: string;
  brand_id: number;
  created_at: string;
  updated_at: string | null;
}

export interface MessageResponse {
  message: string;
}
