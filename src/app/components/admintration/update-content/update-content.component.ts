import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {PaapService} from '../../../services/paap.service';

declare let $, window;

@Component({
  templateUrl: './update-content.component.html'
})
export class UpdateContentComponent implements OnInit {

  subscription: Subscription;
  caption: string;
  contentType: string;
  content: string;
  editorConfig: Object = {
    height: 600
  };

  constructor(private title: Title,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private paapService: PaapService) {
    const self = this;
    self.subscription = activatedRoute.params.subscribe(param => {
      self.contentType = param['type'];
      if (self.contentType === 'about') {
        self.caption = 'Nội dung Giới thiệu';
      } else if (self.contentType === 'terms') {
        self.caption = 'Nội dung Điều khoản';
      }
      title.setTitle('PAAP | Cập nhật nội dung');
    });
  }

  ngOnInit() {
    const self = this;
    console.log(self.contentType);
    self.paapService.getContent(self.contentType).subscribe(
      res => {
        console.log(res);
        if (res.success) {
          self.content = res.data['value'];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  submitUpdateContent(event) {
    const self = this;
    $(event.target).append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
    event.target.setAttribute('disabled', 'disabled');
    self.paapService.updateContent(self.contentType, {value: self.content}).subscribe(
      res => {
        if (res.success) {
          console.log(res);
        }
      },
      err => {
        $(event.target).find('.fa-spinner').remove();
        $(event.target).removeAttr('disabled');
        console.log(err);
      }
    );
  }

  backToAdmin() {
    this.router.navigate(['/administration']);
  }

}
