import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-calc-order',
  templateUrl: './calc-order.component.html',
  styleUrls: ['./calc-order.component.scss'],
})
export class CalcOrderComponent  implements OnInit {

  currencies:any = [];
  usd:number = 0;
  gbp:number = 0;
  eur:number = 0;
  cny:number = 0;
  selected_value:string = "USD";
  total:string = "";
  delivery:number = 0;
  discont:number = 0;
  cost:number = 0;

  constructor() { }

  ngOnInit() {

    let usd = JSON.parse(localStorage.getItem(environment.prefix+"_USD")!);
    let eur = JSON.parse(localStorage.getItem(environment.prefix+"_EUR")!);
    let gbp = JSON.parse(localStorage.getItem(environment.prefix+"_GBP")!);
    let cny = JSON.parse(localStorage.getItem(environment.prefix+"_CNY")!);

    this.usd = parseInt(usd.value); 
    this.gbp = parseInt(gbp.value); 
    this.eur = parseInt(eur.value); 
    this.cny = parseInt(cny.value); 
    this.recalculate();

  }



  recalculate() {

    let current_currency_exchange_value = 0;
    if (this.selected_value=="USD") current_currency_exchange_value = this.usd;
    if (this.selected_value=="EUR") current_currency_exchange_value = this.eur;
    if (this.selected_value=="GBP") current_currency_exchange_value = this.gbp;
    if (this.selected_value=="CNY") current_currency_exchange_value = this.cny;
    console.log(current_currency_exchange_value);

    let total = (this.cost + this.delivery - (this.cost / 100 * this.discont)) * current_currency_exchange_value;
    console.log(total);
    this.total = total.toFixed(0)+" ₽"
  }
  
}
