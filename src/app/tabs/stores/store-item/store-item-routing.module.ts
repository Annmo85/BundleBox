import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreItemPage } from './store-item.page';

const routes: Routes = [
  {
    path: '',
    component: StoreItemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreItemPageRoutingModule {}
