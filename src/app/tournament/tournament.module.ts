import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TournamentRoutingModule } from './tournament-routing.moudule';
import { TournamentComponent } from './tournament.component';
import { TournamentsService } from './tournament.service';
import { Cat404 } from './cat404.component';

@NgModule({
  imports: [CommonModule, TournamentRoutingModule],
  declarations: [TournamentComponent],
  providers: [TournamentsService, Cat404]
})
export class TournamentModule {}
