import {Pipe, PipeTransform} from '@angular/core';
import {UserService} from "../services/user.service";

@Pipe({
  name: 'userInfo'
})
export class UserInfoPipe implements PipeTransform {

  constructor(private userService: UserService) {
  }

  transform(value: string, id: number, info: string) {
    return this.userService.getUser(id).map(res => {
      return res.data[info] ? res.data[info] : 'N/A';
    });
  }

}
