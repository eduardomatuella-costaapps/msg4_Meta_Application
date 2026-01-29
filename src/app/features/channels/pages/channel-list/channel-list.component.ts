import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  welcomeMessage?: string;
  connectedAt: string;
}

@Component({
  selector: 'app-channel-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.scss']
})
export class ChannelListComponent implements OnInit, OnDestroy {
  connectedChannels: ConnectedChannel[] = [];
  isLoading = true;
  isSavingMessage: { [key: number]: boolean } = {};
  showSuccessModal = false;
  showErrorModal = false;
  successMessage = '';
  errorMessage = '';
  
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

  /**
   * Saves the automation welcome message for a channel
   */
  saveWelcomeMessage(channel: ConnectedChannel): void {
    if (!channel.welcomeMessage || !channel.welcomeMessage.trim()) {
      this.showErrorToast('Please enter a welcome message.');
      return;
    }

    this.isSavingMessage[channel.id] = true;
    
    this.metaService.saveAutoReply(
      channel.instagramAccountId,
      'instagram',
      channel.welcomeMessage
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.isSavingMessage[channel.id] = false;
        this.showSuccessToast('Settings Saved Successfully!');
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error saving auto reply:', err);
        this.isSavingMessage[channel.id] = false;
        this.showErrorToast('Error saving settings. Please try again.');
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Shows success modal and auto-hides after 3 seconds
   */
  private showSuccessToast(message: string): void {
    this.successMessage = message;
    this.showSuccessModal = true;
    setTimeout(() => {
      this.showSuccessModal = false;
      this.cdr.markForCheck();
    }, 3000);
  }

  /**
   * Shows error modal and auto-hides after 4 seconds
   */
  private showErrorToast(message: string): void {
    this.errorMessage = message;
    this.showErrorModal = true;
    setTimeout(() => {
      this.showErrorModal = false;
      this.cdr.markForCheck();
    }, 4000);
  }

  /**
   * Closes success modal manually
   */
  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }

  /**
   * Closes error modal manually
   */
  closeErrorModal(): void {
    this.showErrorModal = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
