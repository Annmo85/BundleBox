import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NavController, PopoverController } from '@ionic/angular';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage  implements OnInit{

  constructor(private userService:UserService, private nav:NavController,) {}

  ngOnInit(): void {
    this.userService.loadDashboardData().then(res=>{
      this.nav.navigateRoot(['/tabs/main']);
    })
  }



}
