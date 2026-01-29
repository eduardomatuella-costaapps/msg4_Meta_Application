import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ConnectedChannel {
  id: number;
  facebookPageId: string;
  facebookPageName: string;
  instagramAccountId: string;
  instagramUsername: string;
  instagramProfilePicture: string;
  connectedAt: string;
}

@Injectable({ providedIn: 'root' })
export class MetaIntegrationService {
  private backEndUrl = `${environment.backEndUrl}`;
  private companyUUID: string;

  constructor(private http: HttpClient) {
    // Obter CompanyUUID do localStorage ou passar como parâmetro
    this.companyUUID = localStorage.getItem('cUUID') || '';
  }

  /**
   * Redireciona o usuário para o fluxo de login do Facebook
   */
  redirectToFacebookLogin(): void {
    const params = new URLSearchParams({ company_uuid: this.companyUUID });
    
    this.http.get<{ loginUrl: string }>(
      `${this.backEndUrl}/login-url?${params.toString()}`
    ).subscribe({
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
   * Busca os canais já conectados
   */
  getConnectedChannels(): Observable<ConnectedChannel[]> {
    const params = new URLSearchParams({ company_uuid: this.companyUUID });
    return this.http.get<ConnectedChannel[]>(
      `${this.backEndUrl}/channels?${params.toString()}`
    );
  }

  /**
   * Define o CompanyUUID (útil para aplicações multi-tenant)
   */
  setCompanyUUID(uuid: string): void {
    this.companyUUID = uuid;
    localStorage.setItem('cUUID', uuid);
  }

  /**
   * Saves automatic reply configuration for a Facebook page
   * @param pageId Facebook Page ID
   * @param pageType Type of page (e.g., 'facebook', 'instagram')
   * @param message Welcome message for automation
   * @returns Observable of the save response
   */
  saveAutoReply(pageId: string, pageType: string, message: string): Observable<any> {
    const params = new URLSearchParams({ company_uuid: this.companyUUID });
    const payload = {
      PageID: pageId,
      PageType: pageType,
      WelcomeMessage: message
    };
    return this.http.post<any>(
      `${this.backEndUrl}/save_auto_reply?${params.toString()}`,
      payload
    );
  }
}
