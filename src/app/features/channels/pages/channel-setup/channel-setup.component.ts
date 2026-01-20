import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MetaIntegrationService } from '../../../../core/services/meta-integration.service';

@Component({
  selector: 'app-channel-setup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channel-setup.component.html',
  styleUrls: ['./channel-setup.component.scss']
})
export class ChannelSetupComponent implements OnInit, OnDestroy {
  isConnecting = false;
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
        if (params['cUUID']) {
          this.metaService.setCompanyUUID(params['cUUID']);
        }
        
        // Verifica se voltou do callback do Facebook com sucesso
        if (params['auth_success'] === 'true') {
          this.successMessage = '✅ Sua página foi conectada ao Msg4 com sucesso!';
          setTimeout(() => {
            // Redireciona para a listagem de canais
            this.router.navigate(['/channels']);
          }, 2500);
        } else if (params['error']) {
          this.errorMessage = `❌ Erro ao conectar: ${params['error']}`;
        }
      });
  }

  /**
   * Inicia o fluxo de conexão com o Facebook
   */
  connectWithFacebook(): void {
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
