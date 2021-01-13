import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TournamentComponent } from './tournament.component';
import { AuthGuard } from '@app/auth/auth.guard';

const routes: Routes = [
  // Module is lazy loaded, see app-routing.module.ts
  {
    path: '',
    component: TournamentComponent,
    data: { title: 'Tournament', roles: ['pbplayer'] },
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class TournamentRoutingModule {}
