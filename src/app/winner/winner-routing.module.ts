import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WinnerComponent } from './winner.component';

const routes: Routes = [
  // Module is lazy loaded, see app-routing.module.ts
  { path: '', component: WinnerComponent, data: { title: 'Winner' } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class WinnerRoutingModule {}
