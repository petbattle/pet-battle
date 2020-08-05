import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { HomeComponent } from './home.component';
import { Shell } from '@app/shell/shell.service';

import { AuthGuard } from '@app/auth.guard';

const routes: Routes = [
  Shell.childRoutes([
    { path: '', redirectTo: '/home', pathMatch: 'full', canActivate: [AuthGuard], data: { roles: ['pbadmin'] } },
    {
      path: 'home',
      component: HomeComponent,
      data: { title: extract('Home'), roles: ['pbadmin'] },
      canActivate: [AuthGuard]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class HomeRoutingModule {}
