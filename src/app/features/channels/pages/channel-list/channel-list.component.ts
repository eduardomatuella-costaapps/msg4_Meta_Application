import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MetaIntegrationService } from '../../../../core/services/meta-integration.service';

export interface ConnectedChannel {
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
  imports: [CommonModule, RouterModule],
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.scss']
})
export class ChannelListComponent implements OnInit, OnDestroy {
  connectedChannels: ConnectedChannel[] = [];
  isLoading = true;
  
  private destroy$ = new Subject<void>();

  constructor(
    private metaService: MetaIntegrationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadConnectedChannels();
  }

  /**
   * Carrega os canais já conectados do backend
   */
  private loadConnectedChannels(): void {
    this.metaService.getConnectedChannels()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (channels: ConnectedChannel[]) => {
          this.connectedChannels = channels;
          this.isLoading = false;
          // Força detecção de mudanças para garantir atualização da view
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Erro ao carregar canais:', err);
          this.isLoading = false;
          // Força detecção de mudanças mesmo em caso de erro
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
