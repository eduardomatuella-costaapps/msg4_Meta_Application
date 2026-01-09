/**
 * Modelo de Dados para Integração Meta (Facebook/Instagram)
 */

export interface InstagramAccount {
  id: string;
  username?: string;
  profile_picture_url?: string;
}

export interface FacebookPage {
  id: string; // Page ID
  name: string;
  access_token?: string; // Opcional no front
  instagram_business_account?: InstagramAccount; // Se null, não serve pro nosso caso
  is_connected: boolean; // Flag visual: Já está salvo no nosso banco?
}

export interface ChannelSetupResponse {
  pages: FacebookPage[]; // Lista de páginas trazidas da API do Facebook via Backend
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
}
