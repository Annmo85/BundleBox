import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SelectPVZPageRoutingModule } from './select-pvz-routing.module';
import {CommonComponent} from '../../../components/common/CommonComponent'
import { SelectPVZPage } from './select-pvz.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CommonComponent,
    IonicModule,
    ScrollingModule,
    SelectPVZPageRoutingModule
  ],
  declarations: [SelectPVZPage]
})
export class SelectPVZPageModule {}
