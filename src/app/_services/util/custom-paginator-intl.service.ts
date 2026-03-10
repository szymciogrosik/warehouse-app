import {Injectable, OnDestroy} from '@angular/core';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {CustomTranslateService} from '../translate/custom-translate.service';
import {TranslateService} from '@ngx-translate/core';
import {Subject, takeUntil} from 'rxjs';

@Injectable()
export class CustomPaginatorIntl extends MatPaginatorIntl implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private customTranslateService: CustomTranslateService,
    private translateService: TranslateService
  ) {
    super();

    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getTranslations();
        this.changes.next(); // Trigger the view to update
      });

    this.getTranslations();
  }

  private getTranslations(): void {
    this.itemsPerPageLabel = this.customTranslateService.get('admin.panel.table.paginator.itemsPerPageLabel') || 'Items per page:';
    this.nextPageLabel = this.customTranslateService.get('admin.panel.table.paginator.nextPageLabel') || 'Next page';
    this.previousPageLabel = this.customTranslateService.get('admin.panel.table.paginator.previousPageLabel') || 'Previous page';
    this.firstPageLabel = this.customTranslateService.get('admin.panel.table.paginator.firstPageLabel') || 'First page';
    this.lastPageLabel = this.customTranslateService.get('admin.panel.table.paginator.lastPageLabel') || 'Last page';
  }

  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    const ofText = this.customTranslateService.get('admin.panel.table.paginator.of') || 'of';
    if (length === 0 || pageSize === 0) {
      return `0 ${ofText} ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} ${ofText} ${length}`;
  };

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
