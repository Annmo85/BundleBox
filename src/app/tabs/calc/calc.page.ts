import { Component, OnInit } from '@angular/core';
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import { IonicSlides,  } from '@ionic/angular';
import {UserService} from '../../services/user.service'
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-calc',
  templateUrl: './calc.page.html',
  styleUrls: ['./calc.page.scss'],
})
export class CalcPage implements OnInit {

  is_load: boolean = false;
  dashboardData:any = null;

  usd:number = 0;
  gbp:number = 0;
  eur:number = 0;
  cny:number = 0; 

  swiperModules = [Autoplay, IonicSlides];

  tab_selected:string = "cost-order";

  constructor(private userService:UserService, ) { 

    this.userService.dashboardData.asObservable().subscribe((data:any)=>{
      console.log("this.userService.dashboardData.asObservable().subscribe",data);
      if (data==null) {
        this.userService.loadDashboardData().then(()=>{
          this.getValutes();
        });
      } else {
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

}
