import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {TransportService} from '../../../services/transport.service';
import {TransportModel} from '../../../models/transport-model';
import * as _ from 'lodash';

declare let $, window;

@Component({
  templateUrl: './create-transport.component.html'
})
export class CreateTransportComponent implements OnInit {

  caption = '';
  subscription: Subscription;
  isEdit = false;
  transportData = {
    id: 0,
    name: '',
    description: '',
    level: 0,
    parent_id: 0,
    status: 'Active'
  };
  select2StatusOptions: Select2Options;
  listStatus: any = [
    {
      id: 'Active',
      text: 'Hiện'
    },
    {
      id: 'InActive',
      text: 'Ẩn'
    }
  ];
  listParentTransport: any = [];

  constructor(private title: Title,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private transportService: TransportService) {
    const self = this;
    self.subscription = activatedRoute.params.subscribe(param => {
      self.transportData.id = param['id'];
      if (param['id'] > 0) {
        title.setTitle('PAAP | Sửa loại vận chuyển');
        self.caption = 'Sửa loại vận chuyển';
        self.isEdit = true;
      } else {
        title.setTitle('PAAP | Tạo loại vận chuyển');
        self.caption = 'Tạo loại vận chuyển';
        self.isEdit = false;
      }
    });
    self.listParentTransport.push({id: '0', text: 'Không chọn'});
  }

  ngOnInit() {
    const self = this;
    if (self.transportData.id > 0) {
      self.transportService.getTransport(self.transportData.id).subscribe(
        res => {
          if (res.success) {
            self.transportData = res.data;
          }
        },
        err => {
          console.log(err);
        }
      );
    }
    self.select2StatusOptions = {
      minimumResultsForSearch: -1
    };
    self.transportService.getList({
      getAll: true, filters: {
        level: 0
      }
    }).subscribe(
      res => {
        if (res.success) {
          self.listParentTransport = self.listParentTransport.concat(_.map(res.data.records, (data: any) => {
            return {
              id: data.id.toString(),
              text: data.name
            };
          }));
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  select2ParentIdChanged(e) {
    this.transportData.parent_id = parseInt(e.value, 10);
  }

  select2StatusChanged(e) {
    this.transportData.status = e.value;
  }

  submitTransport(event) {
    const self = this;
    $(event.target).append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
    event.target.setAttribute('disabled', 'disabled');
    if (self.isEdit) {
      self.transportService.update(new TransportModel({
        id: self.transportData.id,
        name: self.transportData.name,
        description: self.transportData.description,
        level: self.transportData.parent_id > 0 ? 1 : 0,
        parent_id: self.transportData.parent_id,
        status: self.transportData.status
      })).subscribe(
        res => {
          if (res.success) {
            window.swal({
              title: 'Thông báo',
              text: 'Bạn đã cập nhật thành công',
              padding: 0,
              customClass: 'paap-swal',
              allowOutsideClick: false,
              showCloseButton: false
            }).then(function () {
              self.router.navigate(['/administration']);
            });
          }
        },
        err => {
          $(event.target).find('.fa-spinner').remove();
          $(event.target).removeAttr('disabled');
          console.log(err);
        }
      );
    } else {
      self.transportService.create(new TransportModel({
        name: self.transportData.name,
        description: self.transportData.description,
        level: self.transportData.parent_id > 0 ? 1 : 0,
        parent_id: self.transportData.parent_id,
        status: self.transportData.status
      })).subscribe(
        res => {
          if (res.success) {
            window.swal({
              title: 'Thông báo',
              text: 'Bạn đã tạo thành công',
              padding: 0,
              customClass: 'paap-swal',
              allowOutsideClick: false,
              showCloseButton: false
            }).then(function () {
              self.router.navigate(['/administration']);
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

  cancelCreateTransport() {
    this.router.navigate(['/administration']);
  }

}
