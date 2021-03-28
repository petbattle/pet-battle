import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { CatsComponent } from './cats.component';
import { CatsService } from './cats.service';
import { CatcardModule } from './cat-card/catcard.module';
import { SharedModule } from '@app/shared';

@NgModule({
  imports: [CommonModule, TranslateModule, CatcardModule, SharedModule],
  declarations: [CatsComponent],
  exports: [CatsComponent],
  providers: [CatsService]
})
export class CatsModule {}
