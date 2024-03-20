import { Component, OnInit } from '@angular/core';
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import {UserService} from '../../services/user.service'
import { environment } from 'src/environments/environment';
import { IonicSlides, NavController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import {NewsModalComponent} from '../../components/news-modal/news-modal.component';

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

  //Акции
  actions:any = [];
  actions_is_load: boolean = false;

  //Отзывы
  private reviews_limit:number = 20;
  private reviews_page:number = 0;
  stores: number = 0;
  public stores_list: any = [];
  reviews_is_load: boolean = false;
  reviews: any = [];
  
  constructor(private userService:UserService, public sanitizer:DomSanitizer,private modalCtrl: ModalController) {}

  ngOnInit() {
    this.loadNews();
    this.loadActions();
    this.loadReviews();
  }

  loadReviews() {
    this.reviews = [];

    this.userService.loadReviewsList(this.reviews_page,this.reviews_limit,this.stores).then( (response:any) => {
      console.log("this.userService.loadReviewsList:");
      console.log(response);
      this.reviews = response.reviews;
      if (this.reviews_page==0) this.stores_list = response.stores;
      this.reviews_is_load = true;    
      this.reviews_page++;  
    })
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

  loadActions() {
    this.actions = []
    this.userService.loadLeads().then(response =>{
      console.log("this.userService.loadLeads:");
      console.log(response);
      response.actions.forEach((lead:any) => {
        this.actions.push(lead);
      });
      this.actions_is_load = true;
    })
  }


  async openNewsItem(news_item: any) {
    const modal = await this.modalCtrl.create({
      component: NewsModalComponent,
      componentProps: { news_item: news_item }
    });
    modal.present();
  }    
        
}
