# Meta Integration - Angular SaaS Module

Este projeto implementa um módulo completo de integração com Meta (Facebook/Instagram) para um sistema SaaS em Angular.

## 📋 Funcionalidades

- ✅ **Fluxo OAuth Server-Side** com Facebook/Meta
- ✅ **Listagem de Páginas** do Facebook com Instagram vinculado
- ✅ **Conexão/Desconexão** de Canais
- ✅ **Ativação/Desativação** do Chatbot Meta
- ✅ **UI Responsiva** com Tailwind CSS
- ✅ **Gerenciamento de Estado** com RxJS
- ✅ **Tratamento de Erros** e Validações

## 🏗️ Arquitetura

### Estrutura de Pastas

```
src/
├── app/
│   ├── app.ts                           # Componente raiz
│   ├── app.routes.ts                    # Configuração de rotas
│   ├── app.config.ts                    # Configuração global
│   ├── core/
│   │   ├── models/
│   │   │   └── channel.model.ts        # Interfaces de dados
│   │   └── services/
│   │       └── meta-integration.service.ts  # Serviço de API
│   └── features/
│       └── channels/
│           └── pages/
│               └── channel-list/
│                   ├── channel-list.component.ts       # Lógica
│                   ├── channel-list.component.html     # Template
│                   └── channel-list.component.scss     # Estilos
├── environments/
│   ├── environment.ts                   # Config desenvolvimento
│   └── environment.prod.ts              # Config produção
└── main.ts
```

## 🔑 Modelos de Dados

### InstagramAccount
```typescript
interface InstagramAccount {
  id: string;
  username?: string;
  profile_picture_url?: string;
}
```

### FacebookPage
```typescript
interface FacebookPage {
  id: string;
  name: string;
  access_token?: string;
  instagram_business_account?: InstagramAccount;
  is_connected: boolean;
}
```

## 🌐 API Endpoints

O serviço comunica com os seguintes endpoints do backend Node.js:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/integrations/meta/login-url` | Obter URL de login OAuth |
| GET | `/integrations/meta/available-pages` | Listar páginas disponíveis |
| POST | `/integrations/meta/connect` | Conectar uma página |
| DELETE | `/integrations/meta/{id}` | Desconectar uma página |
| POST | `/integrations/meta/callback` | Processar callback do OAuth |

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Angular CLI 16+

### Instalação

```bash
cd meta-integration
npm install
```

### Desenvolvimento

```bash
npm start
```

Abra [http://localhost:4200](http://localhost:4200) no navegador.

### Build para Produção

```bash
npm run build
```

## ⚙️ Configuração

### Variáveis de Ambiente

Edite `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',  // URL do backend
  metaAppId: 'SEU_META_APP_ID',     // Seu ID de App Meta
  facebookCallbackUrl: 'http://localhost:4200/auth/facebook/callback'
};
```

Para produção, configure `src/environments/environment.prod.ts` com as URLs corretas.

## 🔐 Fluxo OAuth

1. **Usuário clica** em "Adicionar Nova Conta"
2. **Frontend redireciona** para `redirectToFacebookLogin()`
3. **Backend** monta URL OAuth e redireciona para Facebook
4. **Usuário autoriza** no Facebook
5. **Facebook redireciona** para `/auth/facebook/callback` do backend
6. **Backend processa** código de autorização
7. **Backend redireciona** para `/channels?auth_success=true`
8. **Frontend detecta** query param e carrega página
9. **ChannelListComponent** chama `getAvailablePages()`
10. **Lista de páginas** é exibida ao usuário

## 🎨 Styling

O projeto utiliza **Tailwind CSS** através de classes utilitárias. Para customizar:

1. Edite as classes em `channel-list.component.html`
2. Adicione CSS customizado em `channel-list.component.scss`
3. Modifique `src/styles.scss` para estilos globais

### Classes Principais

- `.min-h-screen` - Altura mínima da tela
- `.bg-gradient-to-br` - Gradiente
- `.shadow-lg` - Sombra
- `.rounded-lg` - Borda arredondada
- `.text-*` - Variações de texto

## 📡 Serviços

### MetaIntegrationService

**Métodos disponíveis:**

```typescript
// Redirecionar para login do Facebook
redirectToFacebookLogin(): void

// Obter URL de login
getLoginUrl(): Observable<{ loginUrl: string }>

// Buscar páginas disponíveis
getAvailablePages(): Observable<FacebookPage[]>

// Conectar uma página
connectPage(page: FacebookPage): Observable<AuthResponse>

// Desconectar uma página
disconnectPage(pageId: string): Observable<AuthResponse>

// Processar callback do OAuth
processOAuthCallback(code: string, state: string): Observable<AuthResponse>
```

## 🧩 Componentes

### ChannelListComponent

**Properties:**
- `pages: FacebookPage[]` - Lista de páginas
- `isLoading: boolean` - Estado de carregamento
- `isConnecting: boolean` - Estado de conexão
- `error: string | null` - Mensagem de erro
- `success: string | null` - Mensagem de sucesso

**Métodos:**
- `ngOnInit()` - Inicializa e verifica query params
- `startIntegration()` - Inicia fluxo OAuth
- `loadPages()` - Carrega lista de páginas
- `onConnect(page)` - Conecta uma página
- `onDisconnect(page)` - Desconecta uma página

## 🛣️ Rotas

```typescript
/channels                    - Página principal de canais
/auth/facebook/callback      - Callback do OAuth (redireciona para /channels)
/                           - Redireciona para /channels
```

## 🐛 Tratamento de Erros

O componente trata os seguintes cenários:

- ✅ Página sem Instagram Business vinculado
- ✅ Erro ao carregar lista de páginas
- ✅ Erro na conexão de página
- ✅ Erro na desconexão de página
- ✅ Timeout de requisição
- ✅ Falha de autenticação OAuth

Cada erro exibe uma mensagem amigável ao usuário.

## 📚 Stack Tecnológico

| Tecnologia | Versão | Propósito |
|------------|--------|----------|
| Angular | 16+ | Framework |
| TypeScript | 5+ | Linguagem |
| RxJS | 7+ | Programação Reativa |
| Tailwind CSS | Utilitários | Styling |
| HttpClient | Angular | Requisições HTTP |

## 🧪 Testing

Para executar testes unitários:

```bash
npm run test
```

Para cobertura de testes:

```bash
npm run test -- --code-coverage
```

## 📦 Dependências

```json
{
  "@angular/animations": "^16.0.0",
  "@angular/common": "^16.0.0",
  "@angular/compiler": "^16.0.0",
  "@angular/core": "^16.0.0",
  "@angular/forms": "^16.0.0",
  "@angular/platform-browser": "^16.0.0",
  "@angular/platform-browser-dynamic": "^16.0.0",
  "@angular/router": "^16.0.0",
  "rxjs": "^7.8.0",
  "tslib": "^2.6.0",
  "zone.js": "^0.13.0"
}
```

## 🔗 Integração com Backend

O backend Node.js deve implementar:

1. **Rota de Login OAuth**
   - GET `/auth/meta/login-url`
   - Retorna URL de OAuth montada

2. **Rota de Páginas Disponíveis**
   - GET `/channels/available`
   - Busca na Graph API do Facebook
   - Cruza com banco local

3. **Rota de Conexão**
   - POST `/channels/connect`
   - Salva no banco
   - Inscreve webhook

4. **Rota de Desconexão**
   - DELETE `/channels/{id}`
   - Remove do banco
   - Desinscreve webhook

## 📖 Documentação Oficial

- [Angular Docs](https://angular.dev)
- [Meta Graph API](https://developers.facebook.com/docs/graph-api)
- [OAuth 2.0](https://oauth.net/2/)

## 🤝 Contribuindo

1. Clone o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Distribuído sob a licença ISC.

## 👨‍💻 Autor

Desenvolvido como especialista em Angular e Node.js para integração Meta SaaS.

---

**Última atualização:** Janeiro 2026
