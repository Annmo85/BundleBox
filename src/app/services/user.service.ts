import { Injectable } from '@angular/core';
import { RequestWrapperService} from './request-wrapper.service';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {


  private openOrder = new BehaviorSubject<any>(null);
  private payments_info = new BehaviorSubject<any>(null);
  public leadChange = new Subject<any>();
  public reloadLeads$ = new Subject<any>();
  

  public dashboardData = new BehaviorSubject<any>(null);

  public actionBadge = new BehaviorSubject<number>(0);

  getDashboardInfo() {
    return this.dashboardData.asObservable();
  }

  reloadBadges():Promise<any> {
    return new Promise((resolve,reject)=>{
      Promise.all([this.loadLeads()]).then(response=>{
        this.actionBadge.next(response[0].deals_for_payement.length);
        console.log("Update badges",response[0].deals_for_payement.length)
        resolve (response);
      })
    })
  }

  loadDashboardData():Promise<any> {
    let lastOrders:any[] = [];
    let stores:any[] = [];
    let news:any[] = [];
    let actions:any[] = [];
    let reviews:any[] = [];
    let currencies:any[] = [];
    let usl_text:any[] = [];
    let calls = [this.loadLastOrders(),this.loadNews(),this.loadLeads(),this.loadReviewsList(1,3),];
    
    return new Promise( (resolve,reject)=>{
      Promise.all(calls).then((response:any)=>{
        // console.log("this.userService.loadLeads:");
        // console.log(response);
        lastOrders = response[0].last_orders;
        stores = response[1].stores;
        news = response[1].news;
        currencies = response[1].currencies;
        usl_text = response[1].usl_text;
        reviews = response[3].reviews;
        actions = response[2].actions;
        currencies.forEach((currency:any) => {
          localStorage.setItem(environment.prefix+"_"+currency.name,JSON.stringify(currency));
        });
        let data = {
          lastOrders:lastOrders,
          stores:stores,
          news:news,
          reviews:reviews,
          actions:actions,
          currencies:currencies,
          usl_text:usl_text,
        };
        this.actionBadge.next(response[2].deals_for_payement.length);
        this.dashboardData.next(data);
        resolve (data);
      })

    });

    
    
  }

  constructor(private _request:RequestWrapperService) { }

  callOrderOpen(eventData: any) {
    this.openOrder.next(eventData);
  }
  callPaymentsInfo(eventData: any) {
    this.payments_info.next(eventData);
  }

  getOrderEvents() {
    return this.openOrder.asObservable();
  }
  getPaymentsInfoEvents() {
    return this.payments_info.asObservable();
  }



  private async makeRequest(action:any, data:any):Promise<any>
  {
     //add session data
     let new_data = data;

    let promise = new Promise( (resolve,reject)=>{

      let response = this._request.post( action,new_data).then( data =>{
        resolve (data.data);
      })
    })
    return promise;     

  }

  private async makeRequestL(action:any, data:any):Promise<any>
  {
     //add session data
     let new_data = data;

    let promise = new Promise( (resolve,reject)=>{

      let response = this._request.postL( action,new_data).then( data =>{
        resolve (data.data);
      })
    })
    return promise;     

  }

  public isLogin() {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    if (user_id === null) return false; else return true;
  }

  public hasEmail() {
    let user_email = localStorage.getItem(environment.prefix + 'user_email');
    if (user_email === null || user_email === "") return false; else return true;
  }

  public async login(phone:string, password:string) {

    let push_id = localStorage.getItem(environment.prefix + 'push_id');
    let response = await this.makeRequest("users.php",{phone:phone, password:password,push_id:push_id, mode:"phone"});
    if (response!=null) {
      console.log("login response:");
      console.log(response);
      if (!response.error) {
        localStorage.setItem(environment.prefix + 'user_phone',phone);
        localStorage.setItem(environment.prefix + 'user_password',password);
        localStorage.setItem(environment.prefix + 'user_id',response.user.ID);
        localStorage.setItem(environment.prefix + 'user_name',response.user.NAME);
        localStorage.setItem(environment.prefix + 'user_email',response.user.EMAIL);
        localStorage.setItem(environment.prefix + 'user_lastname',response.user.LAST_NAME);
        localStorage.setItem(environment.prefix + 'user_city',response.user.CITY_NAME);
      } else {
        localStorage.removeItem(environment.prefix + 'user_id');
        localStorage.removeItem(environment.prefix + 'user_city');
        localStorage.removeItem(environment.prefix + 'user_phone');
        localStorage.removeItem(environment.prefix + 'user_email');
        localStorage.removeItem(environment.prefix + 'user_password');
        localStorage.removeItem(environment.prefix + 'user_name');
      }      
      return response;
    }  else return false; 
  }

  public async loginByEmail(email:string, password:string) {

    let push_id = localStorage.getItem(environment.prefix + 'push_id');
    let response = await this.makeRequest("users.php",{email:email, password:password,push_id:push_id, mode:"email"});
    if (response!=null) {
      console.log("login response:");
      console.log(response);
      if (!response.error) {
        localStorage.setItem(environment.prefix + 'user_email',email);
        localStorage.setItem(environment.prefix + 'user_password',password);
        localStorage.setItem(environment.prefix + 'user_id',response.user.ID);
        localStorage.setItem(environment.prefix + 'user_name',response.user.NAME);
        localStorage.setItem(environment.prefix + 'user_lastname',response.user.LAST_NAME);
        localStorage.setItem(environment.prefix + 'user_city',response.user.CITY_NAME);
      } else {
        localStorage.removeItem(environment.prefix + 'user_id');
        localStorage.removeItem(environment.prefix + 'user_city');
        localStorage.removeItem(environment.prefix + 'user_phone');
        localStorage.removeItem(environment.prefix + 'user_email');
        localStorage.removeItem(environment.prefix + 'user_password');
        localStorage.removeItem(environment.prefix + 'user_name');
      }      
      return response;
    }  else return false; 
  }

  public async updatePvz(pvz:any) {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("user.php",{pvz:pvz, user_id:user_id, action: 'setPvz'});
    if (response!=null) {
      console.log("updatePvz response:");
      console.log(response);
      if (!response.error) {
        //
      }      
      return response;
    }  else return false; 
  }

  public async updateCity(city:any) {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("user.php",{city:city, user_id:user_id, action: 'setCity'});
    if (response!=null) {
      console.log("updateCity response:");
      console.log(response);
      if (!response.error) {
        //
      }      
      return response;
    }  else return false; 
  }

  public async addReview(review_store_id:any, review_stars:any, review_name:any, review_text:any, review_order_id:any, share:any = false) {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequestL("addReview",{
      review_store_id:review_store_id, 
      user_id:user_id, 
      review_order_id:review_order_id, 
      review_stars: review_stars,
      review_name: review_name,
      review_text: review_text,
      share: share,
    });
    if (response!=null) {
      console.log("addReview response:");
      console.log(response);
      if (!response.error) {
        //
      }      
      return response;
    }  else return false; 
  }

  public async updatePwd(pwd:string) {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("user.php",{pwd:pwd, user_id:user_id, action: 'updatePwd'});
    if (response!=null) {
      console.log("updatePwd response:");
      console.log(response);
      if (!response.error) {
        //
      }      
      return response;
    }  else return false; 
  }

  public async updateProfile(name:string, last_name:string, email:string) {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("user.php",{name:name, last_name:last_name, email:email, user_id:user_id, action: 'updateProfile'});
    if (response!=null) {
      console.log("updatePwd response:");
      console.log(response);
      if (!response.error) {
        //
        localStorage.setItem(environment.prefix + 'user_email',response.user.EMAIL);
      }      
      return response;
    }  else return false; 
  }

  public async updateAddress(index:string, city:string, street:string,dom:string,kv:string) {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("user.php",{index:index, city:city, street:street, dom:dom,kv:kv, user_id:user_id,action: 'updateAddress'});
    if (response!=null) {
      console.log("updatePwd response:");
      console.log(response);
      if (!response.error) {
        //
      }      
      return response;
    }  else return false; 
  }

  public async updatePushId(token: string) {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("user.php",{token:token, user_id:user_id, action: 'updatePushId'});
    if (response!=null) {
      console.log("updatePushId response:");
      console.log(response);
      if (!response.error) {
        //
      }      
      return response;
    }     
  }

  public async createUser(name:string, last_name:string, email:string, password:string, phone:string, sms:string, city:string, mode:string = "phone") {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("user.php",{name:name, last_name:last_name, email:email, user_id:user_id, password:password, phone:phone, sms:sms, city:city, mode:mode, action: 'createProfile'});
    if (response!=null) {
      console.log("createUser response:");
      console.log(response);
      if (!response.error) {
        //
      }      
      return response;
    }  else return false; 
  }

  public async resetPassword(phone:string) {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("user.php",{phone:phone, action: 'resetPassword'});
    if (response!=null) {
      console.log("resetPassword response:");
      console.log(response);
      if (!response.error) {
        //
      }      
      return response;
    }  else return false; 
  }

  public async resetPasswordByEmail(email:string) {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("user.php",{email:email, action: 'resetPasswordByEmail'});
    if (response!=null) {
      console.log("resetPassword response:");
      console.log(response);
      if (!response.error) {
        //
      }      
      return response;
    }  else return false; 
  }


  public async logout() {
    localStorage.removeItem(environment.prefix + 'user_password');
    localStorage.removeItem(environment.prefix + 'user_id');
    localStorage.removeItem(environment.prefix + 'user_name');
    localStorage.removeItem(environment.prefix + 'user_email');
    localStorage.removeItem(environment.prefix + 'user_lastname');
    localStorage.removeItem(environment.prefix + 'user_login');
    localStorage.removeItem(environment.prefix + 'user_city');
  }

  public async loadNews(start:number = 0, limit: number = 10) {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("dashboard.php",{start:start,limit:limit});
    this.callPaymentsInfo(response);
    return response;
  }

  public async loadNewsList(start:number = 0, limit: number = 10) {
    let response = await this.makeRequest("news.php",{start:start,limit:limit});
    return response;
  }
  public async loadReviewsList(start:number = 0, limit: number = 10, filter: number[] = []) {
    let response = await this.makeRequestL("getReviews",{start:start,limit:limit,filter:filter});
    return response;
  }

  public async loadLastOrders() {
    let response = await this.makeRequestL("getLastOrders",{});
    return response;
  }

  public async loadOferta() {
    let response = await this.makeRequestL("getOferta",{});
    return response;
  }

  public async loadStoresList(start:number = 0, limit: number = 10) {
    let response = await this.makeRequest("stores.php",{start:start,limit:limit});
    return response;
  }

  public async loadLeads() {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("leads.php",{id:user_id});

    //Сохраним данные
    console.log(response);
    var badge_count = response.badge_count?response.badge_count:0;
    var badge_count_2 = response.badge_count_2?response.badge_count_2:0;
    var orders_count = response.orders_count?response.orders_count:0;
    localStorage.setItem(environment.prefix+"_badge_count",badge_count);
    localStorage.setItem(environment.prefix+"_badge_count_2",badge_count_2);
    localStorage.setItem(environment.prefix+"_orders_count",orders_count);
    return response;
  }

  public async loadRequests() {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("requests.php",{id:user_id});
    return response;
  }

  public async loadClosedLeads() {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("closed_leads.php",{id:user_id});
    console.log(response);
    return response;
  }

  public async loadLead(order_id: any, force:boolean = false) {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("lead.php",{order_id:order_id,user_id:user_id, force:force});
    return response;
  }

  public async deleteRequest() {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("user.php",{user_id:user_id, action: 'delete'});
    return response;
  }

  public async sendSms(phone:string) {
    let response = await this.makeRequest("user.php",{phone:phone, action: 'sendSms'});
    return response;
  }

  public async sendEmail(email:string) {
    let response = await this.makeRequestL("sendemailcode",{email:email, action: 'sendEmail'});
    return response;
  }

  public async getProfile() {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("user.php",{user_id:user_id, action: 'get'});
    return response;
  }

  public async getDeliveryWarehouses(city:any) {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("delivery_calc.php",{user_id:user_id, city:city, action: 'getWarehouses'});
    return response;
  }
  public async getDeliveryPrice(warehouse_id:any, weight:any, city:any) {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("delivery_calc.php",{user_id:user_id, warehouse_id:warehouse_id, weight:weight,city:city, action: 'getDeliveryPrice'});
    return response;
  }
  public async getCities() {
    let user_id = localStorage.getItem(environment.prefix + 'user_id');
    let response = await this.makeRequest("delivery_calc.php",{user_id:user_id, action: 'getCities'});
    return response;
  }

}
