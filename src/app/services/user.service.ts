import {Injectable} from '@angular/core';
import {HelperApiService} from './helper-api.service';

@Injectable()
export class UserService {

  constructor(private helperApiService: HelperApiService) {
  }

  verifyPhone(userData) {
    return this.helperApiService.postApi('users/generate-phone-code', userData);
  }

  register(userData) {
    return this.helperApiService.postApi('users', userData);
  }

  login(username, password) {
    return this.helperApiService.postApi('users/authentication', {
      username: username,
      password: password
    });
  }

  logout() {
    return this.helperApiService.removeApi('users/authentication', true);
  }

  requestPassword(email) {
    return this.helperApiService.postApi('users/forget-password', {
      email: email
    });
  }

  getUser(id: number) {
    return this.helperApiService.getApi('users/' + id);
  }

  update(id, userData) {
    return this.helperApiService.updateApi('users/' + id, userData);
  }

  changePassword(data: { current_password: string, password: string }) {
    return this.helperApiService.updateApi('users/change-password', data, true);
  }

  statistic() {
    return this.helperApiService.getApi('users/statistics', null, true);
  }

  tickets() {
    return this.helperApiService.getApi('users/tickets', null, true);
  }

  paaps() {
    return this.helperApiService.getApi('users/paaps', null, true);
  }

  reviews() {
    return this.helperApiService.getApi('users/reviews', null, true);
  }

}
