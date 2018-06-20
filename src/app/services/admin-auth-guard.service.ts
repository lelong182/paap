import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {LocalStorageService} from "angular-2-local-storage";

@Injectable()
export class AdminAuthGuardService implements CanActivate {
  constructor(private router: Router,
              private localStorageService: LocalStorageService) {
  }

  canActivate() {
    let userData = this.localStorageService.get('userData');
    if (typeof userData !== 'undefined' && !userData) {
      this.router.navigate(['/login']);
      return false;
    } else {
      if(userData['role'] !== 'Admin') {
        this.router.navigate(['/']);
        return false;
      }
      return true;
    }
  }
}
