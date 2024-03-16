import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { MainPageRoutingModule } from './main-routing.module';
import {CommonComponent} from '../../components/common/CommonComponent'
import { MainPage } from './main.page';

@NgModule({
  schemas: [ CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommonComponent,
    MainPageRoutingModule
  ],
  declarations: [MainPage]
})
export class MainPageModule {}
