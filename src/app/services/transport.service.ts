import {Injectable} from '@angular/core';
import {HelperApiService} from "./helper-api.service";

@Injectable()
export class TransportService {

  constructor(private helperApiService: HelperApiService) {
  }

  getList(params = null) {
    return this.helperApiService.getApi('transports', params);
  }

  create(transportData) {
    return this.helperApiService.postApi('transports', transportData, true);
  }

  update(transportData) {
    return this.helperApiService.updateApi('transports/' + transportData.id, transportData, true);
  }

  delete(id) {
    return this.helperApiService.removeApi('transports/' + id, true);
  }

  getTransport(id) {
    return this.helperApiService.getApi('transports/' + id);
  }
}
