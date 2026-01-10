---
applyTo: '**'
---
📋 Especificação Técnica: Módulo de Canais (Integração Meta)
Objetivo: Desenvolver uma interface em Angular para o módulo "Meus Canais". O usuário deve ser capaz de iniciar o fluxo OAuth com o Facebook, visualizar as páginas disponíveis (que possuem conta no Instagram vinculada) e ativar/desativar a integração do Chatbot.

Stack: Angular (v16+), RxJS, HttpClient. Design System Sugerido: Material Design ou Tailwind CSS (básico/limpo).

1. Modelagem de Dados (Interfaces)
Crie o arquivo src/app/core/models/channel.model.ts:

TypeScript

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
2. Estrutura de Serviços (API Communication)
Crie o arquivo src/app/core/services/meta-integration.service.ts. Este serviço deve centralizar a comunicação com seu Backend Node.js.

Endpoints esperados do Backend:

GET /auth/meta/login-url -> Retorna a URL de OAuth montada (com client_id, scopes, etc).

GET /channels/available -> Retorna a lista de páginas do usuário (busca na Graph API e cruza com o banco local para saber se já está conectado).

POST /channels/connect -> Envia o pageId e token para salvar no banco e disparar o subscribed_apps.

DELETE /channels/{id} -> Remove o canal.

Métodos do Service:

TypeScript

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FacebookPage } from '../models/channel.model';

@Injectable({ providedIn: 'root' })
export class MetaIntegrationService {
  private apiUrl = `${environment.apiUrl}/integrations/meta`;

  constructor(private http: HttpClient) {}

  // 1. Iniciar Login: Redireciona o navegador
  redirectToFacebookLogin(): void {
    // Pode vir do backend ou ser hardcoded aqui se preferir
    const appId = environment.metaAppId;
    const redirectUri = `${environment.apiUrl}/auth/facebook/callback`; // Rota do Backend
    const scope = 'instagram_basic,instagram_manage_comments,instagram_manage_messages,pages_show_list,pages_manage_metadata,pages_read_engagement';
    
    window.location.href = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  }

  // 2. Buscar Páginas Disponíveis (Após o retorno do OAuth)
  getAvailablePages(): Observable<FacebookPage[]> {
    return this.http.get<FacebookPage[]>(`${this.apiUrl}/available-pages`);
  }

  // 3. Conectar/Ativar uma Página (Salva token e assina Webhook)
  connectPage(page: FacebookPage): Observable<any> {
    return this.http.post(`${this.apiUrl}/connect`, {
      pageId: page.id,
      name: page.name,
      instagramId: page.instagram_business_account?.id,
      accessToken: page.access_token // Se o backend já tiver em sessão, não precisa mandar
    });
  }
}
3. Componente da Tela (Lógica)
Crie src/app/features/channels/pages/channel-list/channel-list.component.ts.

Comportamento necessário:

Ao iniciar (ngOnInit), verificar se existem query params na URL (ex: ?status=success). Isso indica que o usuário acabou de voltar do login do Facebook.

Se voltou do login, chamar getAvailablePages() automaticamente.

Exibir lista de páginas.

Botão "Conectar" deve ter loading state (spinner) enquanto chama o backend.

TypeScript

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MetaIntegrationService } from 'src/app/core/services/meta-integration.service';
import { FacebookPage } from 'src/app/core/models/channel.model';

@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.scss']
})
export class ChannelListComponent implements OnInit {
  pages: FacebookPage[] = [];
  isLoading = false;
  isConnecting = false;

  constructor(
    private metaService: MetaIntegrationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Verifica se voltou do OAuth do Facebook
    this.route.queryParams.subscribe(params => {
      if (params['auth_success'] === 'true') {
        this.loadPages();
      }
    });
  }

  startIntegration() {
    this.metaService.redirectToFacebookLogin();
  }

  loadPages() {
    this.isLoading = true;
    this.metaService.getAvailablePages().subscribe({
      next: (data) => {
        this.pages = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao listar páginas', err);
        this.isLoading = false;
      }
    });
  }

  onConnect(page: FacebookPage) {
    this.isConnecting = true;
    this.metaService.connectPage(page).subscribe({
      next: () => {
        page.is_connected = true; // Atualiza UI
        alert(`Bot ativado para ${page.name}!`);
        this.isConnecting = false;
      },
      error: () => {
        alert('Erro ao conectar página.');
        this.isConnecting = false;
      }
    });
  }
}
4. O Template HTML (Visual)
Arquivo channel-list.component.html. Simples, focado em mostrar os elementos que a Meta exige no vídeo.

HTML

<div class="container mx-auto p-6">
  
  <div class="flex justify-between items-center mb-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Meus Canais</h1>
      <p class="text-gray-600">Gerencie suas conexões com Instagram e WhatsApp.</p>
    </div>
    
    <button 
      (click)="startIntegration()"
      class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2">
      <i class="fab fa-facebook"></i> Adicionar Nova Conta
    </button>
  </div>

  <div *ngIf="isLoading" class="text-center py-10">
    <p>Carregando páginas do Facebook...</p>
  </div>

  <div *ngIf="!isLoading && pages.length === 0" class="bg-gray-100 p-10 rounded text-center">
    <p>Nenhuma página encontrada. Clique em "Adicionar Nova Conta" para começar.</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" *ngIf="pages.length > 0">
    
    <div *ngFor="let page of pages" class="border rounded-lg p-4 shadow-sm bg-white flex flex-col justify-between">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
          📸
        </div>
        <div>
          <h3 class="font-bold">{{ page.name }}</h3>
          <span class="text-xs text-gray-500">ID: {{ page.id }}</span>
        </div>
      </div>

      <div class="mb-4">
        <span *ngIf="page.instagram_business_account" class="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
          Instagram Business Detectado
        </span>
        <span *ngIf="!page.instagram_business_account" class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
          Sem Instagram Vinculado
        </span>
      </div>

      <button 
        *ngIf="!page.is_connected"
        (click)="onConnect(page)"
        [disabled]="isConnecting || !page.instagram_business_account"
        class="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded disabled:opacity-50">
        Conectar Bot
      </button>

      <button 
        *ngIf="page.is_connected"
        disabled
        class="w-full bg-gray-300 text-gray-700 py-2 rounded cursor-default border border-gray-400">
        ✅ Bot Ativo
      </button>
    </div>

  </div>
</div>
5. Notas Finais para a IA Desenvolvedora
Roteamento: Adicionar rota /channels no app-routing.module.ts.

Redirect do Backend: O Backend Node.js, após processar o /auth/facebook/callback, deve fazer um res.redirect('http://localhost:4200/channels?auth_success=true') para fechar o ciclo e fazer o front recarregar a lista.

Estilização: O HTML acima usa classes utilitárias do Tailwind CSS. Se o projeto não usar Tailwind, instrua a IA a converter para SCSS padrão.