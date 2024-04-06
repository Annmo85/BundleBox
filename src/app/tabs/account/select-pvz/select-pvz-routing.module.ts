import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectPVZPage } from './select-pvz.page';

const routes: Routes = [
  {
    path: '',
    component: SelectPVZPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectPVZPageRoutingModule {}
