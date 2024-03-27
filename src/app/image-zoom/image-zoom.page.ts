import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicSlides, NavController } from '@ionic/angular';
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import { SwiperOptions } from 'swiper/types';

@Component({
  selector: 'app-image-zoom',
  templateUrl: './image-zoom.page.html',
  styleUrls: ['./image-zoom.page.scss'],
})
export class ImageZoomPage implements OnInit {



  @Input()img: string | undefined;
  @ViewChild('swiper') swiper!: ElementRef<any>;

  config:SwiperOptions = {
     zoom: {
      maxRatio: 5,
      minRatio: 1
     }
     
   }

  constructor(private modalController:ModalController) { }

  ngOnInit() {
    console.log(this.img);
  }


  zoom(state:boolean) {
    const swiperElement = this.swiper.nativeElement;
    if (swiperElement.swiper) {
      if (state) {
        swiperElement.swiper.zoom.in();
      } else {
        swiperElement.swiper.zoom.out();
      }
    }
  }

  close() {
    this.modalController.dismiss();
  }

}
