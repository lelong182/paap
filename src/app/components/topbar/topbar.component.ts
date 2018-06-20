import {Component, OnInit} from '@angular/core';
import {AppService} from '../../services/app.service';
import {LocalStorageService} from 'angular-2-local-storage';
import {UserService} from '../../services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'paap-topbar',
  templateUrl: './topbar.component.html'
})
export class TopbarComponent implements OnInit {

  isLogin = false;
  userData;

  constructor(private router: Router,
              private appService: AppService,
              private localStorageService: LocalStorageService,
              private userService: UserService) {
    const self = this;
    appService.userData.subscribe(data => {
      if (data.token !== '') {
        self.isLogin = true;
        self.userData = data;
      }
    });
    appService.passwordChanged.subscribe(res => {
      if (res) {
        self.isLogin = false;
      }
    });
  }

  ngOnInit() {
    if (this.localStorageService.get('userData')) {
      this.isLogin = true;
      this.userData = this.localStorageService.get('userData');
    }
  }

  logout() {
    const self = this;
    self.userService.logout().subscribe(
      (res: any) => {
        if (res.success) {
          self.isLogin = false;
          self.userData = null;
          self.localStorageService.remove('userData');
          self.router.navigate(['/login']);
        }
      },
      err => {
        console.log(err);
      });
  }
}
