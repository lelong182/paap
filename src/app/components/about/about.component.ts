import {Component, OnInit, AfterViewInit, HostBinding} from '@angular/core';
import {slideInDownAnimation} from '../../animations';
import {Title} from '@angular/platform-browser';
import {PaapService} from '../../services/paap.service';
import {LocalStorageService} from 'angular-2-local-storage';

@Component({
  templateUrl: './about.component.html',
  animations: [slideInDownAnimation]
})
export class AboutComponent implements OnInit, AfterViewInit {

  @HostBinding('@routeAnimation') routeAnimation = true;
  @HostBinding('style.display') display = 'block';
  content: string;

  constructor(private title: Title,
              private localStorageService: LocalStorageService,
              private paapService: PaapService) {
    const self = this;
    title.setTitle('PAAP | Giới thiệu');
  }

  ngOnInit() {
    const self = this;
    self.paapService.getContent('about').subscribe(res => {
      self.content = res.data['value'];
    });
  }

  ngAfterViewInit() {
  }

}
