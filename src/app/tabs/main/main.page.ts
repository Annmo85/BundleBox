import { Component, OnInit } from '@angular/core';
import {UserService} from '../../services/user.service'
import { environment } from 'src/environments/environment';
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import { IonicSlides, NavController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { MakeOrderModalComponent } from 'src/app/components/make-order-modal/make-order-modal.component';
import {OfertaComponent} from '../../components/oferta/oferta.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  is_load: boolean = false;
  dashboardData:any = null;

  usd:number = 0;
  gbp:number = 0;
  eur:number = 0;
  cny:number = 0;  

  slideOpts = {
    autoplay: true,
  }
  swiperModules = [Autoplay, IonicSlides];

  make_order_modal: boolean = false;

  constructor(private userService:UserService, public sanitizer:DomSanitizer,private modalCtrl: ModalController) {

    this.userService.dashboardData.asObservable().subscribe((data:any)=>{
      console.log("this.userService.dashboardData.asObservable().subscribe",data);
      if (data==null) {
        this.userService.loadDashboardData();
      } else {
        this.dashboardData = data;
        this.is_load = true;
      }


    })
  }

  ngOnInit() {

    // валюты
    let usd = JSON.parse(localStorage.getItem(environment.prefix+"_USD") || "");
    let eur = JSON.parse(localStorage.getItem(environment.prefix+"_EUR") || "");
    let gbp = JSON.parse(localStorage.getItem(environment.prefix+"_GBP") || "");
    let cny = JSON.parse(localStorage.getItem(environment.prefix+"_CNY") || "");
    this.usd = parseInt(usd.value); 
    this.gbp = parseInt(gbp.value); 
    this.eur = parseInt(eur.value); 
    this.cny = parseInt(cny.value); 

  }


  async openOferta(event:any) {
    console.log(event);
    // if (event.target.tagName=="A") {
      const modal = await this.modalCtrl.create({
        component: OfertaComponent,
        componentProps: {deal:{ID:"________",DATE:"________"}}
      });
      modal.present();
    // }
  }


  async openMakeOrderModal() {
    const modal = await this.modalCtrl.create({
      component: MakeOrderModalComponent,
      initialBreakpoint: 0.3,
      breakpoints: [0,0,3],
      cssClass: "makeOrderModal",
      mode: 'ios'
    });
    modal.present();
  }  
}
