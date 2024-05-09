import { Component, OnInit } from '@angular/core';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {
  badge_count: number = 0;
  
  constructor(private userService:UserService, ) { 
    this.userService.actionBadge.asObservable().subscribe((badge_count:number) =>{
      this.badge_count = badge_count;
    })

  }

  ngOnInit() {
    this.reloadBadeges();
  }

  reloadBadeges() {
    this.userService.reloadBadges().then(res=>{
      setTimeout(() => {
        this.reloadBadeges();
      }, 5000);
    })
  }

}
