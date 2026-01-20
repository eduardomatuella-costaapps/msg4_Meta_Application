import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MetaIntegrationService } from '../../../../core/services/meta-integration.service';

interface ConnectedChannel {
  id: number;
  facebookPageId: string;
  facebookPageName: string;
  instagramAccountId: string;
  instagramUsername: string;
  instagramProfilePicture: string;
  connectedAt: string;
}

@Component({
  selector: 'app-channel-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.scss']
})
export class ChannelListComponent implements OnInit, OnDestroy {
  connectedChannels: ConnectedChannel[] = [];
  isConnecting = false;
  isLoading = true;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private metaService: MetaIntegrationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Pega cUUID do queryParam e salva no localStorage
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        // Verifica se voltou do callback do Facebook
        if (params['success'] === 'true') {
          this.successMessage = '✅ Sua página foi conectada ao Msg4!';
          setTimeout(() => {
            this.loadConnectedChannels();
          }, 1500);
          // Remove query params da URL
          this.router.navigate(['/channels']);
        } else if (params['error']) {
          this.errorMessage = `❌ Erro: ${params['error']}`;
          this.isLoading = false;
        }
      });

    // Carrega canais já conectados
    this.loadConnectedChannels();
  }

  /**
   * Inicia o fluxo OAuth com o Facebook
   */
  connectFacebookPage(): void {
    this.isConnecting = true;
    this.errorMessage = null;
    
    try {
      this.metaService.redirectToFacebookLogin();
    } catch (err) {
      this.errorMessage = 'Erro ao iniciar conexão. Tente novamente.';
      this.isConnecting = false;
      console.error('Erro ao redirecionar para login:', err);
    }
  }

  /**
   * Carrega os canais já conectados
   */
  loadConnectedChannels(): void {
    this.metaService.getConnectedChannels()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (channels: ConnectedChannel[]) => {
          this.connectedChannels = channels;
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Erro ao carregar canais:', err);
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
