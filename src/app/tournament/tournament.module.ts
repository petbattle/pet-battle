import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TournamentRoutingModule } from './tournament-routing.moudule';
import { TournamentComponent } from './tournament.component';
import { TournamentsService } from './tournament.service';

@NgModule({
  imports: [CommonModule, TournamentRoutingModule],
  declarations: [TournamentComponent],
  providers: [TournamentsService]
})
export class TournamentModule {}
