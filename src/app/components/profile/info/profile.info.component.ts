import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {LocalStorageService} from "angular-2-local-storage";
import {UserService} from "../../../services/user.service";
import {AppService} from "../../../services/app.service";
import {UserModel} from "../../../models/user-model";

import * as _ from 'lodash';
declare let window;

@Component({
  templateUrl: './profile.info.component.html'
})
export class ProfileInfoComponent implements OnInit {

  userData;
  passwordData = {
    curPassword: '',
    newPassword: '',
    reNewPassword: '',
  };

  constructor(private router: Router,
              private localStorageService: LocalStorageService,
              private userService: UserService,
              private appService: AppService) {
    this.userData = localStorageService.get('userData');
  }

  ngOnInit() {
  }

  updateProfile(event) {
    $(event.target).append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
    event.target.setAttribute("disabled", "disabled");
    if (this.passwordData.curPassword.trim() !== '') {
      this.userService.changePassword({
        current_password: this.passwordData.curPassword,
        password: this.passwordData.newPassword
      }).subscribe(
        res => {
          if (res.success) {
            this.userService.update(this.userData['id'], new UserModel({
              fullname: this.userData['fullname']
            })).subscribe(
              res2 => {
                if (res2.success) {
                  window.swal({
                    title: 'Thông báo',
                    text: 'Cập nhật thành công',
                    padding: 0,
                    customClass: 'paap-swal',
                    allowOutsideClick: false,
                    showCloseButton: false
                  }).then(() => {
                    this.appService.setPasswordChanged(true);
                    this.localStorageService.remove('userData');
                    this.router.navigate(['/login']);
                  });
                }
              },
              err2 => {
                $(event.target).find('.fa-spinner').remove();
                $(event.target).removeAttr('disabled');
                console.log(err2);
              });
          } else {
            if (res.code === 401) {
              window.swal({
                title: 'Thông báo',
                text: 'Mật khẩu hiện tại chưa chính xác',
                padding: 0,
                customClass: 'paap-swal',
                allowOutsideClick: false,
                showCloseButton: false
              }).then(() => {
                $(event.target).find('.fa-spinner').remove();
                $(event.target).removeAttr('disabled');
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
    } else {
      this.userService.update(this.userData['id'], new UserModel({
        fullname: this.userData['fullname']
      })).subscribe(
        res => {
          if (res.success) {
            $(event.target).find('.fa-spinner').remove();
            $(event.target).removeAttr('disabled');
            this.localStorageService.set('userData', this.userData);
            window.swal({
              title: 'Thông báo',
              text: 'Cập nhật thành công',
              padding: 0,
              customClass: 'paap-swal',
              allowOutsideClick: false,
              showCloseButton: false
            });
          }
        },
        err => {
          $(event.target).find('.fa-spinner').remove();
          $(event.target).removeAttr('disabled');
          console.log(err);
        });
    }
  }

}
