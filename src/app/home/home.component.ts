import {Component, OnInit} from '@angular/core';
import {ScrollService} from "../_services/util/scroll.service";
import {environment} from "../../environments/environment";
import {CustomCommonModule} from "../_imports/CustomCommon.module";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CustomCommonModule],
})
export class HomeComponent implements OnInit {
  constructor(
    private scrollService: ScrollService
  ) {

  }

  ngOnInit(): void {
  }


  protected readonly environment = environment;
}
