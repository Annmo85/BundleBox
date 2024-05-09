import { Component, OnInit } from '@angular/core';
import { IonInput, ModalController, NavController, PopoverController, ToastController,IonicSlides } from '@ionic/angular';
import {UserService} from '../../services/user.service';
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {

  swiperModules = [Autoplay, IonicSlides];


  current_tab:string = "orders";
  order_tab_selected:string = "myorders";
  delete_request: boolean = false;
  is_loaded: boolean = false;
  profile:any = {};
  pvz_list:any = [];  

  closed_orders:any[] = [];  
  closed_orders_loaded: boolean = false;  

  my_orders:any[] = [];  
  my_orders_loaded: boolean = false;

  wait_for_payment_orders:any[] = [];
  wait_for_payment_orders_loaded:boolean = false;

  badge_count: number = 0;

  constructor(private modalCtrl: ModalController, private toastController:ToastController,private userService:UserService, private nav:NavController,) { 

    this.userService.actionBadge.asObservable().subscribe((badge_count:number) =>{
      this.badge_count = badge_count;
      this.badge_count = 10;
    })

    this.userService.reloadLeads$.asObservable().subscribe(()=>{
      this.userService.loadLeads().then(response =>{
        this.my_orders = [];
        this.wait_for_payment_orders = [];
        response.deals_for_payement.forEach((lead:any) => {
          this.wait_for_payment_orders.push(lead);
        });
  
      });
    })

  }

  ngOnInit() {
    
  }

  ionViewWillEnter() {
    this.loadMyOrders();
  }

  loadClosedOrders() {
    if (!this.closed_orders_loaded) {
      this.userService.loadClosedLeads().then(response =>{
        console.log("this.userService.loadClosedLeads:");
        console.log(response);
        response.deals.forEach((lead:any) => {
          this.closed_orders.push(lead);
        });
        this.closed_orders_loaded = true;
      })      
    }
  }


  loadMyOrders() {
    if (!this.my_orders_loaded) {
      this.userService.loadLeads().then(response =>{
        console.log("this.userService.loadLeads:");
        console.log(response);
        this.badge_count = response.badge_count;
        this.userService.actionBadge.next(this.badge_count);
        response.deals.forEach((lead:any) => {
          this.my_orders.push(lead);
        });
        response.deals_for_payement.forEach((lead:any) => {
          this.wait_for_payment_orders.push(lead);
        });
        this.my_orders_loaded = true;
        this.wait_for_payment_orders_loaded = true;
      })      
    }
  }


  doRefreshClosed(event:any) {
    console.log('Begin async operation');
    this.userService.loadClosedLeads().then(response =>{
      console.log("this.userService.loadLeads:");
      console.log(response);
      this.closed_orders = [];
      response.deals.forEach((lead:any) => {
        this.closed_orders.push(lead);
        event.target.complete();
      });
    });
  }

  
  doRefreshMyOrders(event:any) {
    console.log('Begin async operation');

    this.userService.loadLeads().then(response =>{
      console.log("this.userService.loadLeads:");
      console.log(response);
      this.my_orders = [];
      this.wait_for_payment_orders = [];

      response.deals_for_payement.forEach((lead:any) => {
        this.wait_for_payment_orders.push(lead);
      });

      response.deals.forEach((lead:any) => {
        this.my_orders.push(lead);
        event.target.complete();
      });

    });
  }

}
