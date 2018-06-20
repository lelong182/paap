import {Injectable} from '@angular/core';
import {HelperApiService} from "./helper-api.service";

@Injectable()
export class PaapService {

  constructor(private helperApiService: HelperApiService) {
  }


  getList(params, isSearch = false) {
    if (isSearch) {
      return this.helperApiService.getApi('paaps/search', params);
    } else {
      return this.helperApiService.getApi('paaps', params);
    }
  }

  getSimilarList(id, params = null) {
    return this.helperApiService.getApi('paaps/' + id + '/similars', params);
  }

  getProviderSuggestionsList(id, params = null) {
    return this.helperApiService.getApi('paaps/' + id + '/providers', params);
  }

  getPaap(id) {
    return this.helperApiService.getApi('paaps/' + id);
  }

  create(paapData) {
    return this.helperApiService.postApi('paaps', paapData, true);
  }

  update(id, paapData) {
    return this.helperApiService.updateApi('paaps/' + id, paapData);
  }

  getContent(type) {
    return this.helperApiService.getApi('contents/page-' + type);
  }

  updateContent(type, data) {
    return this.helperApiService.updateApi('contents/page-' + type, data, true);
  }

}
