import {Component, OnDestroy, OnInit} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {Subscription} from "rxjs/Subscription";
import {ActivatedRoute} from "@angular/router";
import {LocalStorageService} from "angular-2-local-storage";
import {AppService} from "../../services/app.service";
import {UserService} from "../../services/user.service";
import {AngularFireDatabase} from "angularfire2/database";
import {AngularFireAuth} from "angularfire2/auth";

import * as moment from 'moment';
import * as _ from 'lodash';
declare let $;

@Component({
  templateUrl: './inbox.component.html'
})
export class InboxComponent implements OnInit, OnDestroy {

  inboxId: number;
  paramSubscription: Subscription;
  subscription: Subscription;
  subscription2: Subscription;
  chatSubscription: Subscription;
  userData;
  listInboxClients: Array<any> = [];
  listInboxs: Array<any> = [];
  chatContent: string = '';
  itemsChat: Array<any>;
  userInbox;

  constructor(private title: Title,
              private activatedRoute: ActivatedRoute,
              private localStorageService: LocalStorageService,
              private appService: AppService,
              private userService: UserService,
              private afdb: AngularFireDatabase,
              private afau: AngularFireAuth) {
    title.setTitle('PAAP | Hộp thư');
    this.paramSubscription = activatedRoute.params.subscribe(param => {
      this.itemsChat = [];
      this.inboxId = param['id'];
      this.userInbox = {};
      if (this.inboxId) {
        $('.chat-contents').perfectScrollbar('update');
        $('.personal-content').addClass('is-loading');
        appService.getChannels(this.inboxId).subscribe(res => {
          if (res.success) {
            this.chatSubscription = afdb.list('/chat/msgs/' + res.data.channel).valueChanges().subscribe((res2: any) => {
              this.itemsChat = _.clone(res2);
              $('.personal-content').removeClass('is-loading');
              setTimeout(() => {
                $('.chat-contents').scrollTop(99999);
              }, 300);
            });
          }
        });
        userService.getUser(this.inboxId).subscribe(res2 => {
          this.userInbox = res2.data;
        });
      }
    });
    this.userData = localStorageService.get('userData');
  }

  ngOnInit() {
    $('.inbox-inner').addClass('is-loading');
    this.subscription = this.appService.getFirebaseToken().subscribe(
      res => {
        this.afau.auth.signInWithCustomToken(res.data.token).then((res2) => {
          this.subscription2 = this.afdb.list('/chat/ibs/' + res2.uid).valueChanges().subscribe(() => {
            this.appService.getInboxs().subscribe(
              res3 => {
                if (res3.success) {
                  this.listInboxClients = res3.data.records;
                  $('.inbox-inner').removeClass('is-loading');
                }
              },
              err3 => {
                console.log(err3);
              }
            );
          });
        });
      },
      err => {
        console.log(err);
      }
    );
  }

  submitChatMessage(id, e?) {
    let self = this;
    if (e.type === 'click' || e.keyCode == 13) {
      if (self.chatContent.trim() !== '') {
        self.appService.sendMessage(id, self.chatContent).subscribe(res => {
          console.log(res);
        });
        self.itemsChat.push({
          content: self.chatContent,
          time: moment().unix(),
          receiver: id,
          sender: this.userData.id
        });
        self.chatContent = '';
        $('.chat-contents').perfectScrollbar('update');
        setTimeout(() => {
          $('.chat-contents').scrollTop(99999);
        }, 100);
      }
    }
  }

  ngOnDestroy() {
    this.paramSubscription.unsubscribe();
    this.subscription.unsubscribe();
    this.subscription2.unsubscribe();
    if(this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
  }

}
