import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-make-order-modal',
  templateUrl: './make-order-modal.component.html',
  styleUrls: ['./make-order-modal.component.scss'],
})
export class MakeOrderModalComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  
  openTg() {
    window.open("https://t.me/annabbox","_blank");
  }

  openWa() {
    window.open("https://wa.me/79025665111","_blank");
  }

  openVb() {
    window.open("viber://contact?number=%2B79025665111","_blank");
  }

}
