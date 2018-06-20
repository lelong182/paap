import {Component, OnDestroy, OnInit} from '@angular/core';
import {LocalStorageService} from "angular-2-local-storage";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import {ProviderService} from "../../../services/provider.service";

@Component({
  templateUrl: './provider-details.info.component.html'
})
export class ProviderDetailsInfoComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  subscription2: Subscription;
  providerId: number;
  providerData;

  constructor(private activatedRoute: ActivatedRoute,
              private localStorageService: LocalStorageService,
              private providerService: ProviderService) {
    this.subscription = activatedRoute.params.subscribe(param => {
      this.providerId = param['id'];
    });
  }

  ngOnInit() {
    let providerDetail = this.localStorageService.get('providerDetail' + this.providerId);
    if (providerDetail) {
      this.providerData = providerDetail;
    } else {
      this.subscription2 = this.providerService.fetchCompleted.subscribe(res => {
        if(res) {
          this.providerData = this.localStorageService.get('providerDetail' + this.providerId);
        }
      });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if(this.subscription2 !==  undefined) {
      this.subscription2.unsubscribe();
    }
  }

}
