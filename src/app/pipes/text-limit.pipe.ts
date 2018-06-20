import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'textLimit'
})
export class TextLimitPipe implements PipeTransform {

  transform(value: string, limit: number) {
    let a = value.split(' ');
    let words = 0;
    let i;
    for (i = 0; (i < a.length) && (words < limit); ++i)
      if (a[i].length) ++words;
    return a.splice(0, i).join(' ') + (a.length > limit ? '...' : '');
  }

}
