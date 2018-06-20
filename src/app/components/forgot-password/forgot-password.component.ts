import {Component} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {Router} from "@angular/router";
import {UserService} from "../../services/user.service";

declare let $, window;

@Component({
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {

  forgotData = {
    forgotEmail: ''
  };

  constructor(private title: Title,
              private router: Router,
              private userService: UserService) {
    title.setTitle('PAAP | Quên mật khẩu');
  }

  send(event) {
    let self = this;
    $(event.target).append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
    event.target.setAttribute("disabled", "disabled");
    self.userService.requestPassword(self.forgotData.forgotEmail).subscribe(
      (res: any) => {
        console.log(res);
        if (res.success) {
          window.swal({
            title: 'Thông báo',
            text: 'Yêu cầu thành công. Vui lòng kiếm tra email hoặc tin nhắn điện thoại.',
            padding: 0,
            customClass: 'paap-swal',
            allowOutsideClick: false,
            showCloseButton: false
          }).then(() => {
            self.router.navigate(['/']);
          });
        } else {
          if (res.code === 401) {
            $(event.target).find('.fa-spinner').remove();
            $(event.target).removeAttr("disabled");
            window.swal({
              title: 'Thông báo',
              text: 'Số điện thoại hoặc Email không có trong hệ thống.',
              padding: 0,
              customClass: 'paap-swal',
              allowOutsideClick: false,
              showCloseButton: false
            });
          }
        }
      },
      err => {
        $(event.target).find('.fa-spinner').remove();
        $(event.target).removeAttr("disabled");
        console.log(err);
      });
  }

}
