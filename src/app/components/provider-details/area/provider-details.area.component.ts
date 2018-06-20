import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs/Subscription";
import {Router} from "@angular/router";
import {LocalStorageService} from "angular-2-local-storage";
import {ProviderService} from "../../../services/provider.service";
import {AppService} from "../../../services/app.service";

declare let $;

@Component({
  templateUrl: './provider-details.area.component.html'
})
export class ProviderDetailsAreaComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  providerData;
  listCities: any = [];

  constructor(private router: Router,
              private localStorageService: LocalStorageService,
              private appService: AppService,
              private providerService: ProviderService) {
    let listCitiesSaved = localStorageService.get('listCities');
    if (listCitiesSaved) {
      this.listCities = listCitiesSaved;
    } else {
      appService.getListCity().subscribe(res => {
        this.listCities = res.data.records;
        localStorageService.set('listCities', res.data.records);
      });
    }
  }

  ngOnInit() {
    let parsedUrl = this.router.parseUrl(this.router.url);
    let providerId = +parsedUrl.root.children.primary.segments[1].path;
    let providerDetail = this.localStorageService.get('providerDetail' + providerId);
    if (providerDetail) {
      this.providerData = providerDetail;
      this.setAreasActive(this.providerData.provinces);
    } else {
      this.subscription = this.providerService.fetchCompleted.subscribe(res => {
        if (res) {
          this.providerData = this.localStorageService.get('providerDetail' + providerId);
          this.setAreasActive(this.providerData.provinces);
        }
      });
    }
  }

  setAreasActive(areas: number[]) {
    setTimeout(() => {
      for (let area of areas) {
        $('.map .land#VN-' + area).addClass('active');
        $('#VN-' + area + '-chk').prop('checked', true);
      }
    }, 800);
  }

  ngOnDestroy() {
    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  }

}
