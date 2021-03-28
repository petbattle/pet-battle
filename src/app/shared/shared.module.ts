import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoaderComponent } from './loader/loader.component';
import { MatomoModule } from 'ngx-matomo-v9';

@NgModule({
  imports: [CommonModule, MatomoModule],
  declarations: [LoaderComponent],
  exports: [LoaderComponent, MatomoModule]
})
export class SharedModule {}
