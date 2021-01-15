import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TournamentRoutingModule } from './tournament-routing.moudule';
import { TournamentComponent } from './tournament.component';

@NgModule({
  imports: [CommonModule, TournamentRoutingModule],
  declarations: [TournamentComponent]
})
export class TournamentModule {}
