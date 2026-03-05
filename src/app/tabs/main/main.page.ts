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
import {NewsModalComponent} from '../../components/news-modal/news-modal.component';


@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  is_load: boolean = false;
  dashboardData:any = null;

  // Список новостей с безопасным типом для шаблона
  get newsList(): any[] {
    return (this.dashboardData?.news as any[]) || [];
  }

  usd:number = 0;
  gbp:number = 0;
  eur:number = 0;
  cny:number = 0;  

  slideOpts = {
    autoplay: true,
  }
  swiperModules = [Autoplay, IonicSlides];

  make_order_modal: boolean = false;

  constructor(private nav:NavController, private userService:UserService, public sanitizer:DomSanitizer,private modalCtrl: ModalController) {

    this.userService.dashboardData.asObservable().subscribe((data:any)=>{
      console.log("this.userService.dashboardData.asObservable().subscribe",data);
      if (data==null) {
        this.userService.loadDashboardData().then(()=>{
          this.getValutes();
        });
      } else {
        this.dashboardData = data;
        this.getValutes();
        this.is_load = true;
      }


    })
  }

  ngOnInit() {

    
  }


  getValutes() {
    // валюты
    let usd = JSON.parse(localStorage.getItem(environment.prefix+"_USD") || "0");
    let eur = JSON.parse(localStorage.getItem(environment.prefix+"_EUR") || "0");
    let gbp = JSON.parse(localStorage.getItem(environment.prefix+"_GBP") || "0");
    let cny = JSON.parse(localStorage.getItem(environment.prefix+"_CNY") || "0");
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
      initialBreakpoint: 0.5,
      breakpoints: [0,0,5],
      cssClass: "makeOrderModal",
      mode: 'ios'
    });
    modal.present();
  }  



  
  openUrl(url:string) {
    window.open(url,"_blank");
  }


  
  async openNewsItem(news_item: any) {
    const modal = await this.modalCtrl.create({
      component: NewsModalComponent,
      componentProps: { news_item: news_item }
    });
    modal.present();
  }    


  navigate(url:any,queryParams:any) {
    this.nav.navigateForward(url, {queryParams:queryParams});
  }
}
