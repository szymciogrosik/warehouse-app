import {Component} from '@angular/core';
import {Status} from "../_models/status/status";
import {AssetsService} from "../_services/util/assets.service";
import {CustomCommonModule} from "../_imports/CustomCommon.module";

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
  standalone: true,
  imports: [CustomCommonModule],
})
export class StatusComponent {
  private STATUS_URL: string = 'status/status.json';

  lastDeployTime: string = '';

  constructor(private readAssetsService: AssetsService) {
    this.readAssetsService.getResource(this.STATUS_URL).subscribe({
      next: (data: Status) => this.lastDeployTime = data.lastDeployTime,
      error: (error) => console.error(error)
    });
  }

}
