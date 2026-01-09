import { Routes } from '@angular/router';
import { ChannelListComponent } from './features/channels/pages/channel-list/channel-list.component';

export const routes: Routes = [
  {
    path: 'channels',
    component: ChannelListComponent
  },
  {
    path: 'auth/facebook/callback',
    component: ChannelListComponent
  },
  {
    path: '',
    redirectTo: '/channels',
    pathMatch: 'full'
  }
];
