import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent  implements OnInit {

  @Output() action = new EventEmitter();
  @Input() title:string  = "";
  @Input() height:string  = "40";
  @Input() img:string  = "";
  @Input() disabled:boolean  = false;
  @Input() outline:boolean  = false;

  constructor() { }

  ngOnInit() {}


  click() {
    if (!this.disabled) this.action.emit();
  }

}
