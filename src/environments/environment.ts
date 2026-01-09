/**
 * Configurações de ambiente para desenvolvimento
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000', // Backend Node.js rodando localmente
  metaAppId: '1234567890123456', // Substitua com seu Meta App ID
  facebookCallbackUrl: 'http://localhost:4200/auth/facebook/callback',
  websocketUrl: 'ws://localhost:3000/ws'
};
