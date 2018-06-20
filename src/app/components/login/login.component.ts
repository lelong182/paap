import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {LocalStorageService} from 'angular-2-local-storage';
import {UserService} from '../../services/user.service';
import {AppService} from '../../services/app.service';
import {UserModel} from '../../models/user-model';
import {PaapService} from '../../services/paap.service';

declare let $, window;

@Component({
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  loginData = {
    usernameLogin: '',
    passwordLogin: ''
  };
  registerData = {
    fullnameReg: '',
    emailReg: '',
    passwordReg: '',
    rePasswordReg: '',
    phoneReg: '',
    mstReg: '',
    companyNameReg: '',
    privacyReg: false,
    verifyCode: ''
  };
  temrsContent: string;

  constructor(private title: Title,
              private router: Router,
              private appService: AppService,
              private localStorageService: LocalStorageService,
              private paapService: PaapService,
              private userService: UserService) {
    title.setTitle('PAAP | Đăng nhập');
  }

  ngOnInit() {
    const self = this;
    self.paapService.getContent('terms').subscribe(res => {
      self.temrsContent = res.data['value'];
    });
  }

  login(event) {
    const self = this;
    $(event.target).append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
    event.target.setAttribute('disabled', 'disabled');
    self.userService.login(self.loginData.usernameLogin, self.loginData.passwordLogin).subscribe(
      (res: any) => {
        if (res.success) {
          self.appService.setUserData(res.data);
          self.localStorageService.set('userData', res.data);
          self.router.navigate(['/']);
        } else {
          if (res.code === 401) {
            $(event.target).find('.fa-spinner').remove();
            $(event.target).removeAttr('disabled');
            window.swal({
              title: 'Thông báo',
              text: 'Số điện thoại (hoặc Email) hoặc mật khẩu chưa đúng',
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
        $(event.target).removeAttr('disabled');
        console.log(err);
      });
  }

  verifyPhone(event) {
    const self = this;
    $(event.target).append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
    event.target.setAttribute('disabled', 'disabled');
    self.userService.verifyPhone(
      new UserModel({
        fullname: self.registerData.fullnameReg,
        email: self.registerData.emailReg,
        password: self.registerData.passwordReg,
        phone: self.registerData.phoneReg
      })).subscribe(
      res => {
        if (res.success) {
          $('.verify-modal').modal('show');
        } else {
          $(event.target).find('.fa-spinner').remove();
          $(event.target).removeAttr('disabled');
          if (res.code === 400) {
            let message = '';
            switch (res.exists) {
              case 'phone':
                message = 'Số điện thoại này đã đăng ký';
                break;
              case 'email':
                message = 'Email này đã đăng ký';
                break;
              case 'email,phone':
                message = 'Email và số điện thoại này đã đăng ký';
                break;
              default:
                message = 'Có lỗi xảy ra!';
            }
            $(event.target).find('.fa-spinner').remove();
            $(event.target).removeAttr('disabled');
            window.swal({
              title: 'Thông báo',
              text: message,
              padding: 0,
              customClass: 'paap-swal',
              allowOutsideClick: false,
              showCloseButton: true
            });
          }
        }
      },
      err => {
        $(event.target).find('.fa-spinner').remove();
        $(event.target).removeAttr('disabled');
        console.log(err);
      }
    );
  }

  register(event) {
    const self = this;
    $(event.target).append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
    event.target.setAttribute('disabled', 'disabled');
    self.userService.register({
      fullname: self.registerData.fullnameReg,
      email: self.registerData.emailReg,
      password: self.registerData.passwordReg,
      phone: self.registerData.phoneReg,
      mst: self.registerData.mstReg,
      companyName: self.registerData.companyNameReg,
      phoneVerifyCode: self.registerData.verifyCode
    }).subscribe(
      (res: any) => {
        if (res.success) {
          // $('.verify-modal').modal('hide');
          window.swal({
            title: 'Thông báo',
            text: 'Đăng ký tài khoản thành công',
            padding: 0,
            customClass: 'paap-swal',
            allowOutsideClick: false,
            showCloseButton: false
          }).then(() => {
            self.userService.login(self.registerData.phoneReg, self.registerData.passwordReg).subscribe(
              (res2: any) => {
                if (res2.success) {
                  self.appService.setUserData(res2.data);
                  self.localStorageService.set('userData', res2.data);
                }
              },
              err2 => {
                console.log(err2);
              });
            self.router.navigate(['/']);
          });
        } else {
          $(event.target).find('.fa-spinner').remove();
          $(event.target).removeAttr('disabled');
          if (res.errors.length) {
            window.swal({
              title: 'Thông báo',
              text: 'Email hoặc số điện thoại đã được sử dụng',
              padding: 0,
              customClass: 'paap-swal',
              allowOutsideClick: false,
              showCloseButton: true
            });
          }
          if (res.errors.message === 'PhoneVerifyCodeIsInvalid') {
            $(event.target).find('.fa-spinner').remove();
            $(event.target).removeAttr('disabled');
            window.swal({
              title: 'Thông báo',
              text: 'Mã xác nhận không chính xác',
              padding: 0,
              customClass: 'paap-swal',
              allowOutsideClick: false,
              showCloseButton: true
            });
          }
        }
      },
      err => {
        $(event.target).find('.fa-spinner').remove();
        $(event.target).removeAttr('disabled');
        console.log(err);
      }
    );
  }

}
