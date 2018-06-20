import {Pipe, PipeTransform} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Subscriber} from "rxjs/Subscriber";
import * as moment from 'moment';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: number) {
    return new Observable<string>((observer: Subscriber<string>) => {
      observer.next(moment.unix(value).fromNow());
      setInterval(() => observer.next(moment.unix(value).fromNow()), 1000);
    });
  }

}
