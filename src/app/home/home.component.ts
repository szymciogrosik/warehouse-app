import {Component} from '@angular/core';
import {environment} from "../../environments/environment";
import {CustomCommonModule} from "../_imports/CustomCommon.module";
import {WarehouseViewComponent} from "./warehouse/warehouse.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CustomCommonModule, WarehouseViewComponent],
})
export class HomeComponent {
  protected readonly environment = environment;

  constructor(
  ) {
  }

}
