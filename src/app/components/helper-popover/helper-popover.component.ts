import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-helper-popover',
  templateUrl: './helper-popover.component.html',
  styleUrls: ['./helper-popover.component.scss'],
})
export class HelperPopoverComponent  implements OnInit {

  public stage_helper: string = "";

  
  constructor() { }

  ngOnInit() {}

}
