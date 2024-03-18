import { Component, OnInit } from '@angular/core';
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import {UserService} from '../../services/user.service'
import { environment } from 'src/environments/environment';
import { IonicSlides, NavController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { MakeOrderModalComponent } from 'src/app/components/make-order-modal/make-order-modal.component';

@Component({
  selector: 'app-community',
  templateUrl: './community.page.html',
  styleUrls: ['./community.page.scss'],
})
export class CommunityPage implements OnInit {


  swiperModules = [Autoplay, IonicSlides];

  tab_selected:string = "actions";

  //новости
  news_limit:number = 20;
  news_page:number = 0;
  news: any = [];
  news_is_load: boolean = false;

  constructor(private userService:UserService, public sanitizer:DomSanitizer,private modalCtrl: ModalController) {}

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.news = [];

    this.userService.loadNewsList(this.news_page,this.news_limit).then( (response:any) => {
      console.log("this.userService.loadNewsList:");
      console.log(response);
      this.news = response.news;
      this.news_is_load = true;    
      this.news_page++;  
    })
  }   



  loadMoreNewsData(event:any) {
    this.userService.loadNewsList(this.news_page, this.news_limit).then( (response:any) => {
      console.log("loadMoreData this.userService.loadNewsList:");
      console.log(response);
      response.news.forEach((element:any) => {
        this.news.push(element);
      });
      this.news_page++;
      setTimeout(() => {
        event.target.complete();
      },100);
    })    
  }

}
