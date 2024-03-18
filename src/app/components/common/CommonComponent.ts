/***
 * Общий модуль для подключения остальных модулей
 */

import { NgModule } from '@angular/core';

import { HeaderComponent } from '../header/header.component';
import { ButtonComponent } from '../button/button.component';
import { StoreCardComponent } from '../store-card/store-card.component';
import {MakeOrderModalComponent} from '../make-order-modal/make-order-modal.component';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    ReactiveFormsModule,
    RouterModule
  ],
  declarations: [
    HeaderComponent,
    StoreCardComponent,
    ButtonComponent,
    MakeOrderModalComponent,
  ],
  exports: [
    CommonModule,
    IonicModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    StoreCardComponent,
    MakeOrderModalComponent,
    HeaderComponent
  ],
  providers: []
})
export class CommonComponent {


}