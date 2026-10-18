import {Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {catchError, map, of} from 'rxjs';
import {AssetsService} from "../_services/util/assets.service";
import {TranslatePipe} from '@ngx-translate/core';
import {SkeletonComponent} from '../_shared-components/skeleton/skeleton.component';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
  standalone: true,
  imports: [TranslatePipe, MatCardModule, MatProgressSpinnerModule, SkeletonComponent],
})
export class StatusComponent {
  private STATUS_URL: string = 'status/status.json';

  private readAssetsService = inject(AssetsService);

  lastDeployTime = toSignal(
    this.readAssetsService.getResource(this.STATUS_URL).pipe(
      map((data: any) => data?.lastDeployTime || ''),
      catchError(error => {
        console.error(error);
        return of('');
      })
    ),
    { initialValue: '' }
  );

}

