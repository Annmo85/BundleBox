import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent  implements OnInit {

  @Input() title: string ="";
  @Input() has_back: boolean = false;

  constructor() { }

  ngOnInit() {}

  openTg() {
    window.open("https://t.me/annabbox","_blank");
  }

  openWa() {
    window.open("https://wa.me/79025665111","_blank");
  }

}
