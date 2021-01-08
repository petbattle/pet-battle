import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { CatsComponent } from './cats.component';
import { CatsService } from './cats.service';
import { CatcardModule } from './cat-card/catcard.module';

@NgModule({
  imports: [CommonModule, TranslateModule, CatcardModule],
  declarations: [CatsComponent],
  exports: [CatsComponent],
  providers: [CatsService]
})
export class CatsModule {}
