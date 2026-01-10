import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FacebookPage, AuthResponse } from '../models/channel.model';

/**
 * Serviço centralizado para comunicação com a API de integração Meta
 */
@Injectable({ providedIn: 'root' })
export class MetaIntegrationService {
  private apiUrl = `${environment.apiUrl}/channels`;

  constructor(private http: HttpClient) {}

  /**
   * Redireciona o usuário para o fluxo de login do Facebook
   * Utiliza OAuth Server-Side flow
   */
  redirectToFacebookLogin(): void {
    // Busca a URL de login do backend para iniciar o fluxo OAuth
    this.http.get<{ loginUrl: string }>(`${environment.apiUrl}/auth/meta/login-url`)
      .subscribe({
        next: (response) => {
          window.location.href = response.loginUrl;
        },
        error: (err) => {
          console.error('Erro ao obter URL de login:', err);
          alert('Erro ao iniciar integração com Facebook. Tente novamente.');
        }
      });
  }

  /**
   * Retorna a URL de login do Facebook (alternativa direto no frontend)
   * @returns Observable com a URL de OAuth
   */
  getLoginUrl(): Observable<{ loginUrl: string }> {
    return this.http.get<{ loginUrl: string }>(`${environment.apiUrl}/auth/meta/login-url`);
  }

  /**
   * Busca as páginas disponíveis do usuário após autenticação
   * @returns Observable com lista de FacebookPage
   */
  getAvailablePages(): Observable<FacebookPage[]> {
    return this.http.get<FacebookPage[]>(`${this.apiUrl}/available`);
  }

  /**
   * Conecta/ativa uma página e inscreve o webhook
   * @param page FacebookPage a ser conectada
   * @returns Observable com resposta de sucesso
   */
  connectPage(page: FacebookPage): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/connect`, {
      pageId: page.id,
      name: page.name,
      instagramId: page.instagram_business_account?.id,
      accessToken: page.access_token // Se o backend já tiver em sessão, não precisa mandar
    });
  }

  /**
   * Desconecta/remove uma página
   * @param pageId ID da página a ser removida
   * @returns Observable com resposta de sucesso
   */
  disconnectPage(pageId: string): Observable<AuthResponse> {
    return this.http.delete<AuthResponse>(`${this.apiUrl}/disconnect/${pageId}`);
  }

  /**
   * Processa o callback do Facebook após OAuth
   * @param code Código de autorização retornado pelo Facebook
   * @param state State para validação
   * @returns Observable com resposta de autenticação
   */
  processOAuthCallback(code: string, state: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/meta/callback`, {
      code,
      state
    });
  }
}
