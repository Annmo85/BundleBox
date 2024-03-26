import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { ImageZoomPageRoutingModule } from './image-zoom-routing.module';

import { ImageZoomPage } from './image-zoom.page';
// import { SwiperModule } from 'swiper/angular';

@NgModule({
  schemas: [ CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImageZoomPageRoutingModule
  ],
  declarations: [ImageZoomPage]
})
export class ImageZoomPageModule {}
