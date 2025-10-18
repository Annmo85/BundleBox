import { Component, OnInit } from '@angular/core';
import {UserService} from '../services/user.service';
import { NavController } from '@ionic/angular';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {
  badge_count: number = 0;
  
  constructor(private userService:UserService, private nav:NavController,private router:Router) { 

    const events = router.events.pipe(
      filter(event=>event instanceof NavigationEnd)
    );

    events.subscribe((e:any)=>{
      console.log("urlAfterRedirects",e);
      if (e.url!="/tabs/account" && e.url!="/tabs/account/profile" && !this.userService.hasEmail()) {
        this.nav.navigateForward(['/tabs/account']).then(()=>{
          console.log("перешли");
        })
      }
    })
    
    this.userService.actionBadge.asObservable().subscribe((badge_count:number) =>{
      this.badge_count = badge_count;
    })

  }

  ngOnInit() {
    this.reloadBadeges();
    if (!this.userService.hasEmail()) {
      this.nav.navigateForward(['/tabs/account']).then(()=>{
        console.log("перешли");
      })
    }
  }

  reloadBadeges() {
    this.userService.reloadBadges().then(res=>{
      setTimeout(() => {
        this.reloadBadeges();
      }, 5000);
    })
  }

}
