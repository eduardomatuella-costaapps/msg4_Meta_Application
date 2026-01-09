import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MetaIntegrationService } from '../../../../core/services/meta-integration.service';
import { FacebookPage } from '../../../../core/models/channel.model';

/**
 * Componente responsável pela gerenciamento de canais Meta
 * Exibe lista de páginas do Facebook com Instagram vinculado
 * Permite conectar/desconectar canais e ativar o chatbot
 */
@Component({
  selector: 'app-channel-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.scss']
})
export class ChannelListComponent implements OnInit, OnDestroy {
  pages: FacebookPage[] = [];
  isLoading = false;
  isConnecting = false;
  error: string | null = null;
  success: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private metaService: MetaIntegrationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verifica se voltou do OAuth do Facebook
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['auth_success'] === 'true') {
          this.success = 'Autenticação realizada com sucesso!';
          this.loadPages();
          // Remove query params da URL
          this.router.navigate(['/channels']);
        } else if (params['auth_error']) {
          this.error = `Erro de autenticação: ${params['auth_error']}`;
        }
      });

    // Carrega páginas na inicialização se já estiver autenticado
    this.loadPages();
  }

  /**
   * Inicia o fluxo OAuth com o Facebook
   */
  startIntegration(): void {
    try {
      this.metaService.redirectToFacebookLogin();
    } catch (err) {
      this.error = 'Erro ao iniciar integração. Tente novamente.';
      console.error('Erro ao redirecionar para login:', err);
    }
  }

  /**
   * Carrega a lista de páginas disponíveis
   */
  loadPages(): void {
    this.isLoading = true;
    this.error = null;

    this.metaService.getAvailablePages()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: FacebookPage[]) => {
          this.pages = data;
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Erro ao listar páginas:', err);
          this.error = 'Erro ao carregar páginas. Tente novamente.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Conecta uma página e ativa o chatbot
   * @param page FacebookPage a ser conectada
   */
  onConnect(page: FacebookPage): void {
    if (!page.instagram_business_account) {
      this.error = 'Esta página não possui uma conta Instagram Business vinculada.';
      return;
    }

    this.isConnecting = true;
    this.error = null;
    this.success = null;

    this.metaService.connectPage(page)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          page.is_connected = true;
          this.success = `Bot ativado com sucesso para ${page.name}!`;
          this.isConnecting = false;
        },
        error: (err: any) => {
          console.error('Erro ao conectar página:', err);
          this.error = 'Erro ao conectar página. Tente novamente.';
          this.isConnecting = false;
        }
      });
  }

  /**
   * Desconecta uma página e desativa o chatbot
   * @param page FacebookPage a ser desconectada
   */
  onDisconnect(page: FacebookPage): void {
    if (!confirm(`Tem certeza que deseja desativar o bot para ${page.name}?`)) {
      return;
    }

    this.isConnecting = true;
    this.error = null;
    this.success = null;

    this.metaService.disconnectPage(page.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          page.is_connected = false;
          this.success = `Bot desativado para ${page.name}.`;
          this.isConnecting = false;
        },
        error: (err: any) => {
          console.error('Erro ao desconectar página:', err);
          this.error = 'Erro ao desconectar página. Tente novamente.';
          this.isConnecting = false;
        }
      });
  }

  /**
   * Limpa observables ao destruir o componente
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Verifica se uma página está pronta para conexão
   * @param page FacebookPage a verificar
   * @returns true se a página pode ser conectada
   */
  canConnect(page: FacebookPage): boolean {
    return !!page.instagram_business_account && !page.is_connected;
  }

  /**
   * Verifica se uma página pode ser desconectada
   * @param page FacebookPage a verificar
   * @returns true se a página está conectada
   */
  canDisconnect(page: FacebookPage): boolean {
    return page.is_connected;
  }
}
