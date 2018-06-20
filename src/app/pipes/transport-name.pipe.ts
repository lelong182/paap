import {Pipe, PipeTransform} from '@angular/core';
import {LocalStorageService} from "angular-2-local-storage";

import * as _ from 'lodash';

@Pipe({
  name: 'transportName'
})
export class TransportNamePipe implements PipeTransform {

  constructor(private localStorageService: LocalStorageService) {
  }

  transform(value: number) {
    let name = '';
    let parentName = '';
    let transports = this.localStorageService.get('listTransport');
    _.forEach(transports, function (transport) {
      if(transport.text.substring(0, 2) !== '--') {
        parentName = transport.text + ' ';
      }
      if(parseInt(transport.id) === value) {
        name = transport.text.substring(0, 2) === '--' ? parentName + transport.text : transport.text;
      }
    });
    return name;
  }

}
