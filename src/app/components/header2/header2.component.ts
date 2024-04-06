import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-header2',
  templateUrl: './header2.component.html',
  styleUrls: ['./header2.component.scss'],
})
export class Header2Component  implements OnInit {

  @Input() title: string ="";
  @Input() has_back: boolean = false;
  @Input() has_filter: boolean = false;
  @Output() filterClick = new EventEmitter();

  constructor(private nav:NavController) { }

  ngOnInit() {}

  back() {
    this.nav.back();
  }
}
