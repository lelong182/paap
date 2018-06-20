import {Component, OnInit} from '@angular/core';
import {Router, NavigationEnd} from "@angular/router";
import {TransportService} from "./services/transport.service";
import {AppService} from "./services/app.service";
import {LocalStorageService} from "angular-2-local-storage";

import * as _ from 'lodash';
import * as moment from 'moment';
declare let $;

@Component({
  selector: 'paap-app',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  listTransport: any = [];
  isNoneTemplate: boolean = false;

  constructor(private router: Router,
              private localStorageService: LocalStorageService,
              private transportService: TransportService,
              private appService: AppService) {
    moment.locale('vi');
    appService.currentLang.subscribe(lang => {
      moment.locale(lang);
      localStorageService.set('lang', lang);
    });
    localStorageService.remove('listProviders');
    this.listTransport.push({id: '0', text: 'LOẠI PHƯƠNG TIỆN'});
    appService.isNoneTemplate.subscribe(res => {
      this.isNoneTemplate = res;
    });
  }

  ngOnInit() {
    let self = this;
    self.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      $('html, body').animate({scrollTop: 0}, 200);
    });
    self.transportService.getList({getAll: true}).subscribe(
      res => {
        if (res.success) {
          self.listTransport = self.listTransport.concat(_.map(res.data.records, (data: any) => {
            let txt_lv = '';
            if (data.level > 0) {
              for (let i = 0; i < data.level; i++) {
                txt_lv += '--';
              }
            }
            return {
              id: data.id.toString(),
              text: txt_lv + ' ' + data.name
            }
          }));
          self.localStorageService.set('listTransport', self.listTransport);
          self.appService.setHasFinishedTransportList(true);
        }
      },
      err => {
        console.log(err);
      }
    );
  }
}
