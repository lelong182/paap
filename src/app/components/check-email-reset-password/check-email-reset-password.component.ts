import {Component} from '@angular/core';
import {Title} from "@angular/platform-browser";

@Component({
  templateUrl: './check-email-reset-password.component.html'
})
export class CheckEmailResetPasswordComponent {

  constructor(private title: Title) {
    title.setTitle('PAAP | Kiểm tra mật khẩu mới');
  }

}
