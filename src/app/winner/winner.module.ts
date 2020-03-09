import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { WinnerRoutingModule } from './winner-routing.module';
import { WinnerComponent } from './winner.component';

@NgModule({
  imports: [CommonModule, TranslateModule, WinnerRoutingModule],
  declarations: [WinnerComponent]
})
export class WinnerModule {}
