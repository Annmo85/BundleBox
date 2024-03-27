import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService } from '../../services/user.service';
import { ModalController } from '@ionic/angular';
import {UslPageComponent} from '../../components/usl-page/usl-page.component';

@Component({
  selector: 'app-calc-delivery',
  templateUrl: './calc-delivery.component.html',
  styleUrls: ['./calc-delivery.component.scss'],
})
export class CalcDeliveryComponent  implements OnInit {

  currencies: any = [];
  usd: number = 0;
  gbp: number = 0;
  eur: number = 0;
  warehouse: any;
  warehouse_id: any = 0;
  total: string = "";
  weight: number = 1;
  discont: number = 0;
  cost: number = 0;
  warehouses: any[] = [];
  loaded: boolean = false;
  is_process: boolean = false;
  has_usl: boolean = false;
  compareWith: any;
  text1: any = "";
  text2: any = "";
  text3: any = "";

  note_text: any = "";
   

  constructor(private sanitizer:DomSanitizer, private userService:UserService, private modalController:ModalController, private ref: ChangeDetectorRef ) { }

  ngOnInit() {

    let city = localStorage.getItem(environment.prefix + 'user_city');
    console.log("city",city);
    if (!city || typeof city === 'undefined' || city == 'undefined') city = "";

    this.compareWith = this.compareWithFn;
    let usd = JSON.parse(localStorage.getItem(environment.prefix+"_USD")!);
    let eur = JSON.parse(localStorage.getItem(environment.prefix+"_EUR")!);
    let gbp = JSON.parse(localStorage.getItem(environment.prefix+"_GBP")!);

    this.usd = parseInt(usd.value); 
    this.gbp = parseInt(gbp.value); 
    this.eur = parseInt(eur.value); 

    this.userService.getDeliveryWarehouses(city).then(res=>{
      console.log(res);
      this.warehouses = res.warehouses.warehouses;
      this.text1=this.sanitizer.bypassSecurityTrustHtml(res.warehouses.text1);
      this.text2=this.sanitizer.bypassSecurityTrustHtml(res.warehouses.text2);
      this.text3=this.sanitizer.bypassSecurityTrustHtml(res.warehouses.text3);
      if (res.warehouses.note_text!='') this.has_usl = true;
      this.note_text =this.sanitizer.bypassSecurityTrustHtml(res.warehouses.note_text);
      this.warehouse = this.warehouses[0];
      this.warehouse_id = this.warehouse.id;
      this.recalculate(this.warehouse_id);
      this.loaded = true;
      this.ref.detectChanges();
    })


  }

  compareWithFn(o1:any, o2:any) {
    return o1 === o2;
  };

  recalculate(id:number) {

    console.log("recalculate");

    this.warehouses.forEach(w => {
      if (w.id == id) this.warehouse = w;
    });

    console.log(this.warehouse);
    this.is_process = true;
    if (this.warehouse!==undefined) {
      this.warehouse_id = this.warehouse_id;

      let city = localStorage.getItem(environment.prefix + 'user_city');
      console.log("city",city);
      if (!city || typeof city === 'undefined' || city == 'undefined') city = "";


      this.userService.getDeliveryPrice(this.warehouse_id, this.weight, city).then(res=>{
        console.log("getDeliveryPrice");
        console.log(res);
        if (res.rates.rate.calculated_price!='-') this.total = res.rates.rate.calculated_price.toFixed(2)+' '+this.warehouse.currency;
        else this.total='-';
        this.is_process = false;
      })
    }
  }


  async openUsl() {
    const modal = await this.modalController.create({
      component: UslPageComponent,
    });
    modal.present();
  }
}
