import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { CatsComponent } from './cats.component';
import { CatcardComponent } from './cat-card/catcard.component';
import { CatsService } from './cats.service';

@NgModule({
  imports: [CommonModule, TranslateModule],
  declarations: [CatsComponent, CatcardComponent],
  exports: [CatsComponent],
  providers: [CatsService]
})
export class CatsModule {}
