import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Angulartics2Module } from 'angulartics2';

import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { QuoteService } from './quote.service';

import { CatsModule } from '@app/cats/cats.module';

@NgModule({
  imports: [CommonModule, TranslateModule, CoreModule, SharedModule, Angulartics2Module, HomeRoutingModule, CatsModule],
  declarations: [HomeComponent]
})
export class HomeModule {}
