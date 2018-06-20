import {Component, OnInit, AfterViewInit, HostBinding} from '@angular/core';
import {PaapModel} from '../../models/paap-model';
import {slideInDownAnimation} from '../../animations';
import {Title} from '@angular/platform-browser';
import {ProviderService} from '../../services/provider.service';
import {PaapService} from '../../services/paap.service';
import {LocalStorageService} from 'angular-2-local-storage';
import {ProviderModel} from '../../models/provider-model';
import {AppService} from '../../services/app.service';

declare let $, window;

@Component({
  templateUrl: './home.component.html',
  animations: [slideInDownAnimation]
})
export class HomeComponent implements OnInit, AfterViewInit {

  @HostBinding('@routeAnimation') routeAnimation = true;
  @HostBinding('style.display') display = 'block';
  listPaaps: Array<PaapModel> = [];
  listProviders: Array<ProviderModel> = [];
  page = 0;
  visibleReadmore = true;
  direction = 'desc';
  sortByData;
  userData;

  constructor(private title: Title,
              private localStorageService: LocalStorageService,
              private paapService: PaapService,
              private appService: AppService,
              private providerService: ProviderService) {
    const self = this;
    title.setTitle('PAAP | Trang chủ');
    localStorageService.remove('filterData');
    appService.userData.subscribe(data => {
      if (data.token !== '') {
        self.userData = data;
      }
    });
  }

  ngOnInit() {
    const self = this;
    const listProvidersSaved: any = self.localStorageService.get('listProviders');
    if (self.localStorageService.get('userData')) {
      self.userData = self.localStorageService.get('userData');
    }
    if (listProvidersSaved) {
      self.listProviders = listProvidersSaved;
      setTimeout(function () {
        window.homeClients();
      }, 0);
    } else {
      self.loadClients();
    }
    self.loadPaaps();
  }

  loadPaaps(e?) {
    const self = this;
    $('.list-paaps').addClass('is-loading');
    const params = {limit: 10, page: ++self.page, sorts: self.sortByData};
    if (!self.userData || self.userData.role !== 'Admin') {
      params['filters'] = {status: 'Active'};
    }
    self.paapService.getList(params).subscribe(
      res => {
        if (res.success) {
          if (res.data.paging.pages <= self.page) {
            self.visibleReadmore = false;
          }
          self.listPaaps = self.listPaaps.concat(res.data.records);
        }
      },
      err => {
        console.log(err);
      },
      () => {
        $('.list-paaps').removeClass('is-loading');
        if (e !== undefined) {
          $('html, body').animate({scrollTop: e.target.offsetTop}, 800);
        }
      }
    );
  }

  loadClients() {
    const self = this;
    $('.clients').wrap('<div class="wrap-clients"></div>').css('visibility', 'hidden');
    $('.wrap-clients').addClass('is-loading');
    self.providerService.getList({limit: 12}).subscribe(
      res => {
        if (res.success) {
          self.listProviders = res.data.records;
          self.localStorageService.set('listProviders', self.listProviders);
        }
      },
      err => {
        console.log(err);
      },
      () => {
        setTimeout(function () {
          $('.clients').css('visibility', 'visible');
          window.homeClients();
        }, 0);
        setTimeout(function () {
          $('.wrap-clients').removeClass('is-loading');
          $('.clients').unwrap();
        }, 0);
      }
    );
  }

  sortBy(type) {
    const self = this;
    $('.list-paaps').addClass('is-loading');
    switch (type) {
      case 'start_date':
        self.sortByData = {'arrival_datetime': self.direction};
        break;
      case 'arrival':
        self.sortByData = {'arrival_address': self.direction};
        break;
      case 'departure':
        self.sortByData = {'departure_address': self.direction};
        break;
      case 'transport':
        self.sortByData = {'transport_name': self.direction};
        break;
      case 'created_date':
        self.sortByData = {'created_at': self.direction};
        break;
    }
    self.page = 1;
    self.visibleReadmore = true;
    const params = {sorts: self.sortByData, limit: 10};
    if (self.userData.role !== 'Admin') {
      params['filters'] = {status: 'Active'};
    }
    self.paapService.getList(params).subscribe(
      res => {
        if (res.success) {
          if (res.data.paging.pages <= self.page) {
            self.visibleReadmore = false;
          }
          self.listPaaps = res.data.records;
        }
      },
      err => {
        console.log(err);
      },
      () => {
        $('.list-paaps').removeClass('is-loading');
      }
    );
    self.direction = self.direction === 'desc' ? 'asc' : 'desc';
  }

  ngAfterViewInit() {
  }

}
