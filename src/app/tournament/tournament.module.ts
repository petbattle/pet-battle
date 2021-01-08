import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { TournamentRoutingModule } from './tournament-routing.moudule';
import { TournamentComponent } from './tournament.component';

@NgModule({
  imports: [CommonModule, TranslateModule, TournamentRoutingModule],
  declarations: [TournamentComponent]
})
export class TournamentModule {}
