import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'customNumber'
})
export class CustomNumberPipe implements PipeTransform {

  transform(value: number) {
    return value ? new Intl.NumberFormat('vi-VN').format(value) : '';
  }

}
