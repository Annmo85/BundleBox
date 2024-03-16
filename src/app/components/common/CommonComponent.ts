/***
 * Общий модуль для подключения остальных модулей
 */

import { NgModule } from '@angular/core';

import { HeaderComponent } from '../header/header.component';

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
    HeaderComponent
  ],
  exports: [
    CommonModule,
    IonicModule,
    RouterModule,
    ReactiveFormsModule,
    HeaderComponent
  ],
  providers: []
})
export class CommonComponent {


}