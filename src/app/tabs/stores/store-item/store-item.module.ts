import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreItemPageRoutingModule } from './store-item-routing.module';

import { StoreItemPage } from './store-item.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StoreItemPageRoutingModule
  ],
  declarations: [StoreItemPage]
})
export class StoreItemPageModule {}
