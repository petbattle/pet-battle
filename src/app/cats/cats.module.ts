import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { CatsComponent } from './cats.component';
import { VotesComponent } from './votes/votes.component';

@NgModule({
  imports: [CommonModule, TranslateModule],
  declarations: [CatsComponent, VotesComponent],
  exports: [CatsComponent]
})
export class CatsModule {}
