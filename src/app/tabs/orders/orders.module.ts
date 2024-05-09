import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { OrdersPageRoutingModule } from './orders-routing.module';
import {CommonComponent} from '../../components/common/CommonComponent'
import { OrdersPage } from './orders.page';

@NgModule({
  schemas: [ CUSTOM_ELEMENTS_SCHEMA],  
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommonComponent,
    OrdersPageRoutingModule
  ],
  declarations: [OrdersPage]
})
export class OrdersPageModule {}
