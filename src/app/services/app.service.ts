import {Injectable, EventEmitter} from '@angular/core';
import {HelperApiService} from "./helper-api.service";

@Injectable()
export class AppService {

  currentLang = new EventEmitter<string>();
  userData = new EventEmitter<any>();
  hasFinishedTransportList = new EventEmitter<boolean>();
  isNoneTemplate = new EventEmitter<boolean>();
  passwordChanged = new EventEmitter<boolean>();
  filterNameSuggestion = new EventEmitter<string>();

  constructor(private helperApiService: HelperApiService) {
  }

  setUserData(val: any) {
    this.userData.emit(val);
  }

  setCurrentLang(val: string) {
    this.currentLang.emit(val);
  }

  setHasFinishedTransportList(val: boolean) {
    this.hasFinishedTransportList.emit(val);
  }

  setIsNoneTemplate(val: boolean) {
    this.isNoneTemplate.emit(val);
  }

  setPasswordChanged(val: boolean) {
    this.passwordChanged.emit(val);
  }

  setFilterNameSuggestion(val: string) {
    this.filterNameSuggestion.emit(val);
  }

  getListLocation(params) {
    return this.helperApiService.getApi('locations/search', params);
  }

  createTicket(ticketData) {
    return this.helperApiService.postApi('tickets', ticketData, true);
  }

  updateTicket(id, ticketData) {
    return this.helperApiService.updateApi('tickets/' + id, ticketData, true);
  }

  getInboxs() {
    return this.helperApiService.getApi('messages/inbox-users', null, true);
  }

  getChannels(id) {
    return this.helperApiService.getApi('messages/channels/' + id, null, true);
  }

  sendMessage(id, content) {
    return this.helperApiService.postApi('messages/receivers/' + id, {content: content}, true);
  }

  getFirebaseToken() {
    return this.helperApiService.getApi('messages/token', null, true);
  }

  getListCity() {
    return this.helperApiService.getApi('locations/cities');
  }

}
