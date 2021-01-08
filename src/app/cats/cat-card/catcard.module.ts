import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatcardComponent } from './catcard.component';

@NgModule({
  imports: [CommonModule],
  declarations: [CatcardComponent],
  exports: [CatcardComponent]
})
export class CatcardModule {}
