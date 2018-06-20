import {Component, OnDestroy, ViewEncapsulation} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {Subscription} from "rxjs/Subscription";
import {ActivatedRoute} from "@angular/router";
import {AppService} from "../../services/app.service";

declare let $;

@Component({
  templateUrl: './map-active.component.html',
  styleUrls: ['./map-active.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MapActiveComponent implements OnDestroy {

  subscription: Subscription;

  constructor(private title: Title,
              private activatedRoute: ActivatedRoute,
              private appService: AppService) {
    this.subscription = activatedRoute.params.subscribe(param => {
      title.setTitle('PAAP | Khu vực hoạt động');
      this.setAreasActive(param['ids'].split(','));
    });
    appService.setIsNoneTemplate(true);
  }

  setAreasActive(areas: number[]) {
    setTimeout(() => {
      for (let area of areas) {
        $('.map .land#VN-' + area).addClass('active');
      }
    }, 800);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
