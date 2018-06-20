import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {UserService} from '../../services/user.service';
import {LocalStorageService} from 'angular-2-local-storage';
import {AppService} from '../../services/app.service';
import {FileUploader} from 'ng2-file-upload';

declare let $, window;

@Component({
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

  userData;
  userStatistic;
  listInboxClients: Array<any> = [];
  uploader: FileUploader;
  previewImg: any = '';


  constructor(private title: Title,
              private userService: UserService,
              private appService: AppService,
              private localStorageService: LocalStorageService) {
    this.userData = localStorageService.get('userData');
    title.setTitle('PAAP | ' + this.userData.fullname);
    this.uploader = new FileUploader({
      method: 'POST',
      headers: [
        {
          name: 'X-API-Key',
          value: '6969'
        }, {
          name: 'X-Auth-Token',
          value: localStorageService.get('userData')['token']
        }
      ]
    });
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };
    this.uploader.onCompleteItem = (item, response) => {
      console.log(response);
      let resData = JSON.parse(response);
      this.userData.avatar = resData.data.avatar;
      this.localStorageService.set('userData', this.userData);
      window.swal({
        title: 'Thông báo',
        text: 'Bạn đã cập nhật avatar',
        padding: 0,
        customClass: 'paap-swal',
        allowOutsideClick: false,
        showCloseButton: false
      });
      $('.wrap-avatar').removeClass('is-loading');
    };
  }

  ngOnInit() {
    this.previewImg = this.userData.avatar;
    this.userService.statistic().subscribe(
      res => {
        if (res.success) {
          this.userStatistic = res.data;
        }
      },
      err => {
        console.log(err);
      }
    );
    this.appService.getInboxs().subscribe(
      res => {
        if (res.success) {
          this.listInboxClients = res.data.records;
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  avatarChanged(e) {
    let self = this;
    if (e.target.files && e.target.files[0]) {
      let file = e.target.files[0];
      let img = new Image();
      img.src = window.URL.createObjectURL(e.target.files[0]);
      img.onload = function () {
        let imageWidth = img.naturalWidth;
        let imageHeight = img.naturalHeight;
        window.URL.revokeObjectURL(img.src);
        if (imageWidth > 1000 || imageHeight > 1000) {
          window.swal({
            title: 'Thông báo',
            text: 'Hình có kích thước quá 1000x1000. Vui lòng chọn hình khác.',
            padding: 0,
            customClass: 'paap-swal',
            allowOutsideClick: false,
            showCloseButton: false
          });
          $('.wrap-avatar').removeClass('is-loading');
        } else if (file.size > 2097152) {
          window.swal({
            title: 'Thông báo',
            text: 'Hình vượt quá 2MB. Vui lòng chọn hình khác.',
            padding: 0,
            customClass: 'paap-swal',
            allowOutsideClick: false,
            showCloseButton: false
          });
          $('.wrap-avatar').removeClass('is-loading');
        } else {
          $('.wrap-avatar').addClass('is-loading');
          self.uploader.setOptions({
            url: 'https://api.paap.vn/api/avatars/users/' + self.userData.id
          });
          setTimeout(() => {
            self.uploader.uploadAll();
          }, 0);
        }
      };
    }
  }

}
