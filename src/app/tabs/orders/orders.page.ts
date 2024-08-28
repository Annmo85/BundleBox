import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IonInput, ModalController, NavController, PopoverController, ToastController,IonicSlides } from '@ionic/angular';
import {UserService} from '../../services/user.service';
import Swiper from 'swiper';
import { Autoplay } from 'swiper/modules';
import { Browser } from '@capacitor/browser';
import {environment} from '../../../environments/environment';

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

  my_requests:any[] = [];  
  my_orders:any[] = [];  
  my_orders_loaded: boolean = false;
  my_requests_loaded: boolean = false;

  wait_for_payment_orders:any[] = [];
  wait_for_payment_orders_loaded:boolean = false;

  all_delivery_summ_p:string = "";
  all_payments_summ_p:string = "";
  all_payments_qty: number = 0;
  all_delivery_qty: number = 0;
  all_delivery_summ: number = 0;
  all_payments_summ: number = 0;
  selected_radio:string = "";

  badge_count: number = 0;

  constructor(private modalCtrl: ModalController, private toastController:ToastController,private userService:UserService, private nav:NavController, private ref: ChangeDetectorRef) { 

    this.userService.actionBadge.asObservable().subscribe((badge_count:number) =>{
      this.badge_count = badge_count;
    })

    this.userService.reloadLeads$.asObservable().subscribe(()=>{
      this.userService.loadLeads().then(response =>{
        this.my_orders = [];
        this.wait_for_payment_orders = [];
        response.deals_for_payement.forEach((lead:any) => {
          this.wait_for_payment_orders.push(lead);
        });

        this.all_delivery_summ_p = response.all_delivery_summ_p;
        this.all_payments_summ_p = response.all_payments_summ_p;
        this.all_payments_qty = response.all_payments_qty;
        this.all_delivery_qty = response.all_delivery_qty;
        this.all_delivery_summ = response.all_delivery_summ;
        this.all_payments_summ  = response.all_payments_summ;        

        this.ref.detectChanges();
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
        this.ref.detectChanges();
      })      
    }
  }


  loadMyRequests() {
    if (!this.my_requests_loaded) {
      this.userService.loadRequests().then(response =>{
        console.log("this.userService.loadRequests:");
        console.log(response);
        // this.badge_count = response.badge_count;
        // this.userService.actionBadge.next(this.badge_count);
        response.leads.forEach((lead:any) => {
           this.my_requests.push(lead);
        });


        // response.deals_for_payement.forEach((lead:any) => {
        //   this.wait_for_payment_orders.push(lead);
        // });
        this.my_requests_loaded = true;

        this.ref.detectChanges();
      })      
    }
  }


  doRefreshMyRequests(event:any) {
    // this.my_requests_loaded = false;
      this.userService.loadRequests().then(response =>{
        console.log("this.userService.loadRequests:");
        console.log(response);
        this.my_requests = [];
        response.leads.forEach((lead:any) => {
           this.my_requests.push(lead);
          //  event.target.complete();
          //  this.ref.detectChanges();
        });
        setTimeout(()=>{
          this.my_requests_loaded = true;
          event.target.complete();
          this.ref.detectChanges();
        },1000)
        // this.my_requests_loaded = true;
        // this.ref.detectChanges();
      })      
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

        this.all_delivery_summ_p = response.all_delivery_summ_p;
        this.all_payments_summ_p = response.all_payments_summ_p;
        this.all_payments_qty = response.all_payments_qty;
        this.all_delivery_qty = response.all_delivery_qty;
        this.all_delivery_summ = response.all_delivery_summ;
        this.all_payments_summ  = response.all_payments_summ;        

        this.my_orders_loaded = true;
        this.wait_for_payment_orders_loaded = true;
        this.ref.detectChanges();
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
        this.ref.detectChanges();
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


      this.all_delivery_summ_p = response.all_delivery_summ_p;
      this.all_payments_summ_p = response.all_payments_summ_p;
      this.all_payments_qty = response.all_payments_qty;
      this.all_delivery_qty = response.all_delivery_qty;
      this.all_delivery_summ = response.all_delivery_summ;
      this.all_payments_summ  = response.all_payments_summ;
      this.ref.detectChanges();
      response.deals.forEach((lead:any) => {
        this.my_orders.push(lead);
        event.target.complete();
        this.ref.detectChanges();
      });

    });
  }

  handleChange(ev:any) {
    console.log(ev)
    this.selected_radio = ev.detail.value;
  }

  async gotoOnlinePayment() {

    if (this.selected_radio === 'payment') {
      let user_id = localStorage.getItem(environment.prefix + 'user_id');
      await Browser.open({ url: 'https://bundlebox.ru/mobile/widget/payment.php?id='+user_id});
    } else {
      let user_id = localStorage.getItem(environment.prefix + 'user_id');
      await Browser.open({ url: 'https://bundlebox.ru/mobile/widget/delivery.php?id='+user_id});
    }

  }

}
