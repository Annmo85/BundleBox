import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicSlides, NavController } from '@ionic/angular';

SwiperCore.use([Zoom]);

@Component({
  selector: 'app-image-zoom',
  templateUrl: './image-zoom.page.html',
  styleUrls: ['./image-zoom.page.scss'],
})
export class ImageZoomPage implements OnInit {



  @Input()img: string;
  @ViewChild('swiper') swiper:SwiperComponent;

  config:SwiperOptions = {
    zoom: true
  }

  constructor(private modalController:ModalController) { }

  ngOnInit() {
    console.log(this.img);
  }


  zoom(state:boolean) {
    let zoom = this.swiper.swiperRef.zoom;
    if (state) zoom.in(); else zoom.out();
  }

  close() {
    this.modalController.dismiss();
  }

}
