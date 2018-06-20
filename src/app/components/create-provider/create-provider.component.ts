import {Component, OnDestroy, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {LocalStorageService} from 'angular-2-local-storage';
import {ProviderService} from '../../services/provider.service';
import {UserService} from '../../services/user.service';
import {AppService} from '../../services/app.service';
import {ProviderModel} from '../../models/provider-model';
import {FileUploader} from 'ng2-file-upload';
import {UserModel} from '../../models/user-model';
import * as _ from 'lodash';

declare let $, window;

@Component({
  templateUrl: './create-provider.component.html'
})
export class CreateProviderComponent implements OnInit, OnDestroy {

  urlProviderApi = 'https://api.paap.vn/api/providers/';
  urlDocsApi = 'https://api.paap.vn/api';
  subscription: Subscription;
  userData;
  listTransport: any = [];
  listCities: any = [];
  providerData = {
    id: 0,
    name: '',
    phone: '',
    email: '',
    address: '',
    curPassword: '',
    password: '',
    rePassword: '',
    excerpt: '',
    gpdkkd: '',
    gpvt: '',
    mst: '',
    companyName: '',
    description: '',
    discounts: [{rid: 0, code: '', value: '', description: ''}],
    transports: [{rid: 0, id: 0, name: '', description: ''}],
    provinces: [],
    verifyCode: ''
  };
  provinces = [];
  uploader: FileUploader;
  docsUploader: FileUploader;
  docsUploadType: 'gpdkkd';
  previewImg: any = '';
  isEdit = false;
  changePassword = false;

  constructor(private title: Title,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private localStorageService: LocalStorageService,
              private providerService: ProviderService,
              private userService: UserService,
              private appService: AppService) {
    const self = this;
    self.subscription = activatedRoute.params.subscribe(param => {
      self.providerData.id = param['id'];
      if (param['id'] > 0) {
        title.setTitle('PAAP | Sửa đối tác');
        self.isEdit = true;
      } else {
        title.setTitle('PAAP | Tạo đối tác');
        self.isEdit = false;
      }
    });
    self.userData = localStorageService.get('userData');
    const listCitiesSaved = localStorageService.get('listCities');
    if (listCitiesSaved) {
      self.listCities = listCitiesSaved;
    } else {
      self.appService.getListCity().subscribe(res => {
        self.listCities = res.data.records;
        self.localStorageService.set('listCities', res.data.records);
      });
    }
    self.uploader = new FileUploader({
      method: 'POST',
      headers: [
        {
          name: 'X-API-Key',
          value: '6969'
        }, {
          name: 'X-Auth-Token',
          value: self.localStorageService.get('userData')['token']
        }
      ]
    });
    self.docsUploader = new FileUploader({
      method: 'POST',
      headers: [
        {
          name: 'X-API-Key',
          value: '6969'
        }, {
          name: 'X-Auth-Token',
          value: self.localStorageService.get('userData')['token']
        }
      ],
      url: self.urlDocsApi + '/upload'
    });
    self.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };
    self.docsUploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };
    let updateCompleteText = '';
    if (self.isEdit) {
      updateCompleteText = 'Cập nhật dịch vụ thành công';
    } else {
      updateCompleteText = 'Bạn đã tạo dịch vụ thành công';
    }
    self.uploader.onCompleteAll = () => {
      window.swal({
        title: 'Thông báo',
        text: updateCompleteText,
        padding: 0,
        customClass: 'paap-swal',
        allowOutsideClick: false,
        showCloseButton: false
      }).then(function () {
        self.router.navigate(['/providers']);
      });
    };
    self.docsUploader.onCompleteItem = (item, response) => {
      const res = JSON.parse(response);
      if (res.success) {
        self.providerData[self.docsUploadType] = res.data['url'];
      }
    };
    self.docsUploader.onCompleteAll = () => {
      console.log('done');
    };
    providerService.providerDataDiscounts.subscribe(res => {
      self.providerData.discounts.push(res);
    });
    providerService.providerDataTransports.subscribe(res => {
      self.providerData.transports.push(res);
    });
  }

  ngOnInit() {
    const self = this;
    if (self.providerData.id > 0) {
      self.providerService.getProvider(self.providerData.id).subscribe(res => {
        if (res.success) {
          if (self.userData.role !== 'Admin' && res.data.email !== self.userData.email) {
            window.swal({
              title: 'Thông báo',
              text: 'Bạn không có quyền sửa nhà xe này.',
              padding: 0,
              customClass: 'paap-swal',
              allowOutsideClick: false,
              showCloseButton: false
            }).then(() => {
              self.router.navigate(['/']);
            });
          }
          self.providerData = Object.assign({}, res.data);
          delete self.providerData['rating'];
          delete self.providerData['created_at'];
          delete self.providerData['updated_at'];
          delete self.providerData['status'];
          self.previewImg = res.data.avatar;
          self.providerData.discounts = _.map(self.providerData.discounts, (discount) => {
            discount.rid = window.Math.floor(window.Math.random() * 9999) + 1111;
            return discount;
          });
          self.providerData.transports = _.map(self.providerData.transports, (transport) => {
            transport.rid = window.Math.floor(window.Math.random() * 9999) + 1111;
            return transport;
          });
          setTimeout(() => {
            for (const pv of res.data.provinces) {
              $('.wrap-active-area #VN-' + pv + '-chk').trigger('click');
            }
          }, 300);
        }
      });
    }
    const listTransportSaved = self.localStorageService.get('listTransport');
    if (listTransportSaved) {
      self.listTransport = listTransportSaved;
    } else {
      self.appService.hasFinishedTransportList.subscribe(res => {
        if (res) {
          self.listTransport = self.localStorageService.get('listTransport');
        }
      });
    }
  }

  select2Changed(transports, event) {
    transports.id = parseInt(event.value, 10);
  }

  updateChecked(event) {
    if (event.target.checked) {
      this.provinces.push(event.target.value);
    } else {
      this.provinces = this.provinces.filter((v) => v !== event.target.value);
    }
    this.providerData.provinces = this.provinces;
  }

  getPreviewImg(e) {
    const self = this;
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const img = new Image();
      img.src = window.URL.createObjectURL(e.target.files[0]);
      img.onload = function () {
        const imageWidth = img.naturalWidth;
        const imageHeight = img.naturalHeight;
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
        } else if (file.size > 2097152) {
          window.swal({
            title: 'Thông báo',
            text: 'Hình vượt quá 2MB. Vui lòng chọn hình khác.',
            padding: 0,
            customClass: 'paap-swal',
            allowOutsideClick: false,
            showCloseButton: false
          });
        } else {
          const reader = new FileReader();
          reader.onload = (ev) => {
            self.previewImg = ev.target['result'];
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      };
    }
  }

  uploadDocs(e, type) {
    const self = this;
    let isVerify = true;
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        if (file.size > 2097152) {
          window.swal({
            title: 'Thông báo',
            text: 'Hình vượt quá 2MB. Vui lòng chọn file khác.',
            padding: 0,
            customClass: 'paap-swal',
            allowOutsideClick: false,
            showCloseButton: false
          });
          isVerify = false;
        }
      } else {
        const img = new Image();
        img.src = window.URL.createObjectURL(e.target.files[0]);
        img.onload = function () {
          const imageWidth = img.naturalWidth;
          const imageHeight = img.naturalHeight;
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
            isVerify = false;
          } else if (file.size > 2097152) {
            window.swal({
              title: 'Thông báo',
              text: 'Hình vượt quá 2MB. Vui lòng chọn hình khác.',
              padding: 0,
              customClass: 'paap-swal',
              allowOutsideClick: false,
              showCloseButton: false
            });
            isVerify = false;
          }
        };
      }
      if (isVerify) {
        self.docsUploadType = type;
        self.docsUploader.uploadAll();
      }
    }
  }

  isNewAvatar() {
    return this.previewImg === this.providerData['avatar'];
  }

  verifyPhone(event) {
    const self = this;
    $(event.target).append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
    event.target.setAttribute('disabled', 'disabled');
    self.providerData.discounts = _.map(self.providerData.discounts, (discount) => {
      delete discount.rid;
      return discount;
    });
    self.providerData.transports = _.map(self.providerData.transports, (transport) => {
      const tmp = _.find(self.listTransport, {'id': transport.id + ''});
      transport.name = tmp.text.replace('-- ', '');
      delete transport.rid;
      return transport;
    });
    self.userService.verifyPhone(
      new UserModel({
        fullname: self.providerData.name,
        email: self.providerData.email,
        password: self.providerData.password,
        phone: self.providerData.phone
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

  submitProvider(event) {
    const self = this;
    $(event.target).append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
    event.target.setAttribute('disabled', 'disabled');
    self.providerData.discounts = _.map(self.providerData.discounts, (discount) => {
      delete discount.rid;
      return discount;
    });
    self.providerData.transports = _.map(self.providerData.transports, (transport) => {
      const tmp = _.find(self.listTransport, {'id': transport.id + ''});
      transport.name = tmp.text.replace('-- ', '');
      delete transport.rid;
      return transport;
    });
    if (self.isEdit) {
      this.providerService.update(new ProviderModel({
        id: self.providerData.id,
        name: self.providerData.name,
        phone: self.providerData.phone,
        email: self.providerData.email,
        address: self.providerData.address,
        current_password: self.providerData.curPassword,
        password: self.providerData.password,
        excerpt: self.providerData.excerpt,
        companyName: self.providerData.companyName,
        mst: self.providerData.mst,
        gpdkkd: self.providerData.gpdkkd,
        gpvt: self.providerData.gpvt,
        description: self.providerData.description,
        discounts: self.providerData.discounts,
        transports: self.providerData.transports,
        provinces: self.providerData.provinces
      })).subscribe(
        res => {
          if (res.success) {
            if (self.isNewAvatar()) {
              window.swal({
                title: 'Thông báo',
                text: 'Cập nhật dịch vụ thành công',
                padding: 0,
                customClass: 'paap-swal',
                allowOutsideClick: false,
                showCloseButton: false
              }).then(function () {
                self.router.navigate(['/providers']);
              });
            } else {
              self.uploader.setOptions({
                url: self.urlProviderApi + res.data.id + '/avatar'
              });
            }
          }
        },
        err => {
          $(event.target).find('.fa-spinner').remove();
          $(event.target).removeAttr('disabled');
          console.log(err);
        },
        () => {
          if (!self.isNewAvatar()) {
            self.uploader.uploadAll();
          }
        }
      );
    } else {
      this.providerService.create(new ProviderModel({
        name: self.providerData.name,
        phone: self.providerData.phone,
        email: self.providerData.email,
        address: self.providerData.address,
        password: self.providerData.password,
        excerpt: self.providerData.excerpt,
        companyName: self.providerData.companyName,
        mst: self.providerData.mst,
        gpdkkd: self.providerData.gpdkkd,
        gpvt: self.providerData.gpvt,
        description: self.providerData.description,
        discounts: self.providerData.discounts,
        transports: self.providerData.transports,
        provinces: self.providerData.provinces,
        phoneVerifyCode: self.providerData.verifyCode
      })).subscribe(
        res => {
          if (res.success) {
            self.uploader.setOptions({
              url: self.urlProviderApi + res.data.id + '/avatar'
            });
          }
        },
        err => {
          $(event.target).find('.fa-spinner').remove();
          $(event.target).removeAttr('disabled');
          console.log(err);
        },
        () => {
          $('.verify-modal').modal('hide');
          self.uploader.uploadAll();
        }
      );
    }
  }

  toggleChangePassword() {
    this.changePassword = !this.changePassword;
  }

  addCouponBlock() {
    this.providerService.setProviderDataDiscounts({
      rid: window.Math.floor(window.Math.random() * 9999) + 1111,
      code: '',
      value: '',
      description: ''
    });
  }

  addVehicleBlock() {
    this.providerService.setProviderDataTransports({
      rid: window.Math.floor(window.Math.random() * 9999) + 1111,
      id: 0,
      description: ''
    });
  }

  removeCouponBlock(event, index) {
    this.providerData.discounts.splice(index, 1);
    $(event.target).closest('.row').remove();
  }

  removeVehicleBlock(event, index) {
    this.providerData.transports.splice(index, 1);
    $(event.target).closest('.row').remove();
  }

  backToList() {
    this.router.navigate(['/providers']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  resetPassword(event, email) {
    const self = this;
    $(event.target).append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
    event.target.setAttribute('disabled', 'disabled');
    this.userService.requestPassword(email).subscribe(
      res => {
        if (res.success) {
          window.swal({
            title: 'Thông báo',
            text: 'Khôi phục mật khẩu thành công',
            padding: 0,
            customClass: 'paap-swal',
            allowOutsideClick: false,
            showCloseButton: false
          }).then(function () {
            self.router.navigate(['/providers']);
          });
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
