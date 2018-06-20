import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ProviderModel} from '../../models/provider-model';
import {ProviderService} from '../../services/provider.service';

declare let $;

@Component({
  templateUrl: './providers.component.html'
})
export class ProvidersComponent implements OnInit {

  page = 0;
  visibleReadmore = true;
  direction = 'desc';
  sortByData;
  listProviders: Array<ProviderModel> = [];

  constructor(private title: Title,
              private providerService: ProviderService) {
    title.setTitle('PAAP | Đối tác');
  }

  ngOnInit() {
    const self = this;
    self.loadProviders();
    self.providerService.isRefreshList.subscribe(res => {
      if (res) {
        self.page = 0;
        self.visibleReadmore = true;
        self.loadProviders(true);
      }
    });
  }

  loadProviders(isRefresh = false, e?) {
    const self = this;
    $('.list-services').addClass('is-loading');
    self.providerService.getList({limit: 6, page: ++self.page, sorts: self.sortByData}).subscribe(
      res => {
        if (res.success) {
          if (res.data.paging.pages <= self.page) {
            self.visibleReadmore = false;
          }
          if (isRefresh) {
            self.listProviders = res.data.records;
          } else {
            self.listProviders = self.listProviders.concat(res.data.records);
          }
        }
      },
      err => {
        console.log(err);
      },
      () => {
        $('.list-services').removeClass('is-loading');
        if (e !== undefined) {
          $('html, body').animate({scrollTop: e.target.offsetTop}, 800);
        }
      }
    );
  }

  sortBy(type) {
    const self = this;
    $('.list-services').addClass('is-loading');
    switch (type) {
      case 'name':
        self.sortByData = {'name': self.direction};
        break;
      case 'rating':
        self.sortByData = {'rating': self.direction};
        break;
    }
    self.page = 1;
    self.visibleReadmore = true;
    self.providerService.getList({sorts: self.sortByData, limit: 6}).subscribe(
      res => {
        if (res.success) {
          if (res.data.paging.pages <= self.page) {
            self.visibleReadmore = false;
          }
          self.listProviders = res.data.records;
        }
      },
      err => {
        console.log(err);
      },
      () => {
        $('.list-services').removeClass('is-loading');
      }
    );
    self.direction = self.direction === 'desc' ? 'asc' : 'desc';
  }

}
