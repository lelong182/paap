import {Component} from '@angular/core';
import {AppService} from "../../services/app.service";

@Component({
  selector: 'paap-provider-filters',
  templateUrl: './provider-filters.component.html'
})
export class ProviderFiltersComponent {

  filterName: string = '';

  constructor(private appService: AppService) {
  }

  submitFilter() {
    this.appService.setFilterNameSuggestion(this.filterName);
  }

}
