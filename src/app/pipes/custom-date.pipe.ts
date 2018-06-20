import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {

  transform(value: number) {
    return value ? moment(value).format('h:mm A, DD/MM/YYYY') : '';
  }

}
