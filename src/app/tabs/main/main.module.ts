import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainPageRoutingModule } from './main-routing.module';
import {CommonComponent} from '../../components/common/CommonComponent'
import { MainPage } from './main.page';

@NgModule({
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
