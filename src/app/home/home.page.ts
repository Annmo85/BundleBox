import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NavController, PopoverController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage  implements OnInit{

  constructor(private userService:UserService, private nav:NavController,) {}

  ngOnInit(): void {

    let phone =  localStorage.getItem(environment.prefix + 'user_phone') || '';
    let password = localStorage.getItem(environment.prefix + 'user_password') || '';
    
    this.userService.login(phone, password).then(response =>{
      console.log("this.userService.login",response);
      if (response.error) {
        //this.nav.navigateRoot(['login']);
        this.nav.navigateRoot(['login']);
      } else {
        this.userService.loadDashboardData().then(res=>{
          this.nav.navigateRoot(['/tabs/main']);
        })
      }
    })      

  }



}
