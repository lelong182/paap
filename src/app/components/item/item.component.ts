import {Component, Input} from '@angular/core';
import {PaapModel} from '../../models/paap-model';

@Component({
  selector: 'paap-item',
  templateUrl: './item.component.html'
})
export class ItemComponent {

  @Input() paap: PaapModel;

}
