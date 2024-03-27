import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import {UserService} from '../../services/user.service'
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.page.html',
  styleUrls: ['./stores.page.scss'],
})
export class StoresPage implements OnInit {

  private limit:number = 20;
  private page:number = 0;
  public stores: any = [];
  badge_count: number = 0;
  private is_load: boolean = false;
  private is_reload: boolean = false;

  constructor(private userService:UserService, public sanitizer:DomSanitizer,private modalCtrl: ModalController) {}

  ngOnInit() {
    this.loadStores();
  }

  loadStores() {
    this.stores = [];

    this.userService.loadStoresList(this.page,this.limit).then( (response:any) => {
      console.log("this.userService.loadNewsList:");
      console.log(response);
      this.stores = response.stores;
      this.is_load = true;    
      this.page++;  
    })
  } 

  doRefresh(event:any) {
    this.stores = [];
    this.is_reload = true;
    this.page = 0;
    this.userService.loadStoresList().then( (response:any) => {
      console.log("this.userService.loadStoresList:");
      console.log(response);
      this.stores = response.stores;
      this.is_load = true;
      this.is_reload = false;    
      event.target.complete(); 
    })
  }

  loadMoreData(event:any) {
    this.userService.loadStoresList(this.page, this.limit).then( (response:any) => {
      console.log("loadMoreData this.userService.loadStoresList:");
      console.log(response);
      response.stores.forEach((element:any) => {
        this.stores.push(element);
      });
      this.page++;
      setTimeout(() => {
        event.target.complete();
      },100);
    })    
  }
}
