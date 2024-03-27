import { Component, OnInit } from '@angular/core';
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import { IonicSlides,  } from '@ionic/angular';

@Component({
  selector: 'app-calc',
  templateUrl: './calc.page.html',
  styleUrls: ['./calc.page.scss'],
})
export class CalcPage implements OnInit {

  swiperModules = [Autoplay, IonicSlides];

  tab_selected:string = "cost-order";

  constructor() { }

  ngOnInit() {
  }

}
