import {Injectable} from '@angular/core';

import * as _ from 'lodash';
declare let window, $: any;

@Injectable()
export class UtilService {

  constructor() {
  }

  // capitalize
  static capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  static mapObject2Array(objectData, blankOption = true) {
    let data = [];
    if (blankOption) {
      data.push({key: '', value: 'Vui lòng chọn'});
    }
    for (let key in objectData) {
      data.push({key: key, value: objectData[key]});
    }

    return data;
  }

  static moneyFormat(value: string) {
    if (value === null) {
      return '';
    }

    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // valid url
  static urlValid(url) {
    let regExp = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;

    return regExp.test(url);
  }

  //convert string
  static convertString(str: string) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ  |ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ  |ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g, " ");
    str = str.replace(/-+-/g, " ");
    str = str.replace(/^\-+|\-+$/g, " ");
    str = str.trim();
    return str;
  }

  //convert param to URL query
  static buildUrl(url: string, parameters?: any) {
    let qs = '';
    for (let key in parameters) {
      let value = parameters[key];
      qs += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
    }
    if (qs.length > 0) {
      qs = qs.substring(0, qs.length - 1); //chop off last "&"
      url = url + '?' + qs;
    }

    return url;
  }

  static getValue() {
    let obj = arguments[0];
    if (obj == null) {
      return 0;
    }
    for (let i = 1; i < arguments.length; i++) {
      let v = arguments[i];
      if (v == null && typeof obj == 'object') {
        return 0;
      }
      obj = obj[v];
      if (obj == null) {
        return 0;
      }
    }
    return obj;
  }


  static getReportValue(...args: any[]) {
    let obj = this.getValue.apply(undefined, args);
    if (typeof obj === 'number') {
      return parseFloat(obj.toFixed(4));
    }

    return obj;
  }


  static getPercentWithPastTime(x: number, y: number, round: number = 2) {
    if (!y || y == 0) {
      return 100;
    } else {
      return _.round((x - y) * 100 / y, 2);
    }
  }

  static convertToNumber(value) {
    if (value != '') {
      if (typeof value === 'string') {
        value = value.replace(/[^\d,]/g, '');
      }
      value = parseInt(value);
    } else {
      value = 0;
    }
    return value;
  }

  static isUUID(input) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input);
  }

  static hasValue(item) {
    return typeof item !== 'undefined' && item != '' && item != null;
  }

  static computeCTR(click, imp) {
    return (imp > 0) ? _.round((click / imp) * 100, 2) : 0;
  }

  static computeCPC(cost, click) {
    return (click > 0) ? _.round(cost / click, 0) : 0;
  }

  static computeCPA(cost, actions) {
    return (actions > 0) ? _.round(cost / actions, 0) : 0;
  }

  static computeCR(actions, click) {
    return (click > 0) ? _.round((actions / click) * 100, 2) : 0;
  }

  static subString(str: any = '', start: any = 0, end: any = 1) {
    return str.substring(start, end);
  }

  static toHumanTime = function (timeBlock) {
    let timeStr = timeBlock.toString();

    return timeStr.substring(0, 4) + '-' + timeStr.substring(4, 6) + '-' + timeStr.substring(6, 8);
  }

  /*
   * Parse current block.
   * For example, 'thisweek' of 13/07/2016 is: {last: 20160704, curr: 20160711, end: 20160713}
   *
   * @param kind: 'thismonth', 'thisweek', 'today', 'lastmonth', 'lastweek', 'yesterday', '7days', '30days', 'custom'
   * @param start Only for 'custom', format: YYYY-MM-DD
   * @param end Only for 'custom', format: YYYY-MM-DD
   * @returns {{last: number, curr: number, end: number}}
   */
  static parseTimeRange(kind: string, startTime: any = null, endTime: any = null) {
    let current = window.moment();
    let last = null;
    let curr = null;
    let end = null;

    switch (kind) {
      case "custom": {
        if (startTime != null && endTime != null) {
          if (startTime === '1970-01-01') {
            curr = window.moment(startTime).format('YYYY-MM-DD');
            end = window.moment(endTime).format('YYYY-MM-DD');
            last = curr;
          } else {
            curr = window.moment(startTime).format('YYYY-MM-DD');
            end = window.moment(endTime).format('YYYY-MM-DD');
            let diff = window.moment(endTime).diff(window.moment(startTime), 'days');
            last = window.moment(startTime).subtract(diff + 1, 'days').format('YYYY-MM-DD');
          }
        }
        break;
      }
      case "today": {
        curr = current.format('YYYY-MM-DD');
        end = current.format('YYYY-MM-DD');
        last = current.subtract(1, 'days').format('YYYY-MM-DD');
        break;
      }
      case "yesterday": {
        curr = window.moment(startTime).format('YYYY-MM-DD');
        end = window.moment(endTime).format('YYYY-MM-DD');
        last = window.moment(startTime).subtract(1, 'days').format('YYYY-MM-DD');
        break;
      }
      case "7days": {
        curr = window.moment(startTime).format('YYYY-MM-DD');
        end = window.moment(endTime).format('YYYY-MM-DD');
        last = window.moment(startTime).subtract(7, 'days').format('YYYY-MM-DD');
        break;
      }
      case "14days": {
        curr = window.moment(startTime).format('YYYY-MM-DD');
        end = window.moment(endTime).format('YYYY-MM-DD');
        last = window.moment(startTime).subtract(14, 'days').format('YYYY-MM-DD');
        break;
      }
      case "30days": {
        curr = window.moment(startTime).format('YYYY-MM-DD');
        end = window.moment(endTime).format('YYYY-MM-DD');
        last = window.moment(startTime).subtract(30, 'days').format('YYYY-MM-DD');
        break;
      }
      case "lastmonth": {
        curr = window.moment(startTime).format('YYYY-MM-DD');
        end = window.moment(endTime).format('YYYY-MM-DD');
        last = window.moment(startTime).subtract(1, 'months').format('YYYY-MM-DD');
        break;
      }
      case "thismonth": {
        curr = window.moment(startTime).format('YYYY-MM-DD');
        end = window.moment(endTime).format('YYYY-MM-DD');
        last = window.moment(startTime).subtract(1, 'months').format('YYYY-MM-DD');
        break;
      }
      case "lastweek": {
        curr = window.moment(startTime).format('YYYY-MM-DD');
        end = window.moment(endTime).format('YYYY-MM-DD');
        last = window.moment(startTime).subtract(1, 'weeks').format('YYYY-MM-DD');
        break;
      }
      case "thisweek":
      default: {
        curr = window.moment(startTime).format('YYYY-MM-DD');
        end = window.moment(endTime).format('YYYY-MM-DD');
        last = window.moment(startTime).subtract(1, 'weeks').format('YYYY-MM-DD');
      }
    }
    return {
      last: last,
      curr: curr,
      end: end
    }
  }

  /*
   * Enumerate days between dates
   * @param startDate (miliseconds): start date
   * @param endDate (miliseconds): end date
   * @return dates(array)
   */
  static enumerateDaysBetweenDates(startDate, endDate, dateFormat: string = 'DD-MM-YYYY', timeType: string = 'Daily') {
    startDate = window.moment(startDate);
    endDate = window.moment(endDate);

    let dates = [];
    let currDate = startDate.clone().startOf('day');
    let lastDate = endDate.clone().endOf('day');
    let now = currDate;

    while (now.diff(lastDate) <= 0) {
      // displayTime which is used for draw chart
      // dateObj: moment date obj
      let item = {
        displayTime: window.moment(currDate.clone()).format(dateFormat),
        dateObj: window.moment(currDate.clone())
      };
      dates.push(item);
      if (timeType === 'Daily') {
        now = currDate.add(1, 'days');
      } else {
        now = currDate.add(1, 'hours');
      }
    }

    return dates;
  }

  static getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  static sortReportList(list) {
    return _.orderBy(list, [function (item) {
      if (!_.isUndefined(item['report']) && !_.isUndefined(item['report']['action'])) {
        return item['report']['action'];
      } else {
        return 0;
      }
    }, function (item) {
      if (!_.isUndefined(item['report']) && !_.isUndefined(item['report']['click'])) {
        return item['report']['click'];
      } else {
        return 0;
      }
    }, function (item) {
      if (!_.isUndefined(item['report']) && !_.isUndefined(item['report']['impression'])) {
        return item['report']['impression'];
      } else {
        return 0;
      }
    }], ['desc', 'desc']);
  }

  static loadCSS(href, id) {
    $("head").append($("<link data-id='" + id + "' rel='stylesheet' type='text/css' href='" + href + "'>"));
  };

  static loadJS(src, id) {
    if ($('[data-id="' + id + '"]').length) {
      $('[data-id="' + id + '"]').remove();
    }
    $("head").append($("<script data-id='" + id + "' type='text/javascript' src='" + src + "'>"));
  };

  static removeLinks(id) {
    $('[data-id="' + id + '"]').remove();
  }

  static pageLoading() {
    window.loading_screen = window.pleaseWait({
      logo: "assets/images/logo.svg",
      backgroundColor: '#34a853',
      loadingHtml: '<div class="sk-circle"><div class="sk-circle1 sk-child"></div><div class="sk-circle2 sk-child"></div><div class="sk-circle3 sk-child"></div><div class="sk-circle4 sk-child"></div><div class="sk-circle5 sk-child"></div><div class="sk-circle6 sk-child"></div><div class="sk-circle7 sk-child"></div><div class="sk-circle8 sk-child"></div><div class="sk-circle9 sk-child"></div><div class="sk-circle10 sk-child"></div><div class="sk-circle11 sk-child"></div><div class="sk-circle12 sk-child"></div></div>'
    });
  };

  static finishPageLoading() {
    window.loading_screen.finish();
    $('body').css('opacity', 1);
  };

  static initDataForAngular2Select(arr, value, lable) {
    return _.map(arr, function (n) {
      return _.merge(n, {value: n[value].toString(), label: n[lable]});
    });
  }
}
