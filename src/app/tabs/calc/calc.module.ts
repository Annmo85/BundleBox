import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { CalcPageRoutingModule } from './calc-routing.module';
import {CommonComponent} from '../../components/common/CommonComponent'
import { CalcPage } from './calc.page';

@NgModule({
  schemas: [ CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommonComponent,
    CalcPageRoutingModule
  ],
  exports: [
    FormsModule
  ],
  declarations: [CalcPage]
})
export class CalcPageModule {}
