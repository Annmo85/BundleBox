import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectPvzOzonPage } from './select-pvz-ozon.page';

const routes: Routes = [
  {
    path: '',
    component: SelectPvzOzonPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectPvzOzonPageRoutingModule {}
