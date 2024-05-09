import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'main',
        loadChildren: () => import('./main/main.module').then( m => m.MainPageModule)
      },
      {
        path: 'community',
        loadChildren: () => import('./community/community.module').then( m => m.CommunityPageModule)
      },
      {
        path: 'stores',
        loadChildren: () => import('./stores/stores.module').then( m => m.StoresPageModule)
      },
      {
        path: 'calc',
        loadChildren: () => import('./calc/calc.module').then( m => m.CalcPageModule)
      },
      {
        path: 'account',
        loadChildren: () => import('./account/account.module').then( m => m.AccountPageModule)
      },
      {
        path: 'orders',
        loadChildren: () => import('./orders/orders.module').then( m => m.OrdersPageModule)
      },      
    ]
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
