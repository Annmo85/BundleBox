/***
 * Общий модуль для подключения остальных модулей
 */

import { NgModule } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { Header2Component } from '../header2/header2.component';
import { ButtonComponent } from '../button/button.component';
import { StoreCardComponent } from '../store-card/store-card.component';
import {MakeOrderModalComponent} from '../make-order-modal/make-order-modal.component';
import {ActionItemComponent} from '../action-item/action-item.component';
import {ReviewItemComponent} from '../review-item/review-item.component';
import {NewsModalComponent} from '../news-modal/news-modal.component';
import {ImageZoomPageModule} from '../../image-zoom/image-zoom.module'
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  schemas: [ CUSTOM_ELEMENTS_SCHEMA],
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
    Header2Component,
    ActionItemComponent,
    MakeOrderModalComponent,
    ReviewItemComponent,
    NewsModalComponent,
  ],
  exports: [
    CommonModule,
    IonicModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    StoreCardComponent,
    ActionItemComponent,
    Header2Component,
    MakeOrderModalComponent,
    ReviewItemComponent,
    NewsModalComponent,
    HeaderComponent
  ],
  providers: []
})
export class CommonComponent {


}