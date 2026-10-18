import {AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, input, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {SmartTableColumn} from './smart-table.model';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {SkeletonComponent} from '../skeleton/skeleton.component';

@Component({
  selector: 'app-smart-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    TranslatePipe,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    SkeletonComponent,
  ],
  templateUrl: './smart-table.component.html',
  styleUrl: './smart-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmartTableComponent<T> implements AfterViewInit {
  data = input<T[]>([]);
  loading = input<boolean>(false);
  columns = input<SmartTableColumn<T>[]>([]);
  filterPlaceholderKey = input<string>('admin.panel.table.filter.placeholder');
  headerAction = input<{
    icon: string;
    tooltipKey: string;
    color?: 'primary' | 'accent' | 'warn';
    onClick: () => void;
  } | undefined>(undefined);

  protected dataSource = new MatTableDataSource<T>([]);
  protected displayedColumns = computed(() => this.columns().map(col => col.key));

  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);

  constructor() {
    effect(() => {
      // By reading this.columns(), the effect will re-run when columns change.
      // This is necessary because if a column's nested properties (like 'actions') change asynchronously,
      // mat-table won't update existing rows unless the data array reference changes.
      const cols = this.columns();

      if (this.loading() && (!this.data() || this.data().length === 0)) {
        this.dataSource.data = [{} as any, {} as any, {} as any, {} as any, {} as any];
      } else {
        this.dataSource.data = [...this.data()];
      }
    });
    effect(() => {
      const p = this.paginator();
      if (p) this.dataSource.paginator = p;
    });
    effect(() => {
      const s = this.sort();
      if (s) this.dataSource.sort = s;
    });
  }

  ngAfterViewInit(): void {
    // Default sorting logic for nested objects if needed, but defaults are usually fine
    this.dataSource.sortingDataAccessor = (item: T, property: string) => {
      const column = this.columns().find(c => c.key === property);
      if (column && column.valueFn) {
        return column.valueFn(item);
      }
      return (item as any)[property];
    };

    this.dataSource.filterPredicate = (data: T, filter: string) => {
      const dataStr = this.columns().reduce((currentTerm: string, col) => {
        let val = this.getCellValue(col, data);
        if (val === null || val === undefined) val = '';
        return currentTerm + String(val).toLowerCase() + '◬';
      }, '');
      return dataStr.includes(filter);
    };
  }

  protected applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  protected getCellValue(col: SmartTableColumn<T>, element: T): any {
    if (col.valueFn) {
      return col.valueFn(element);
    }
    return (element as any)[col.key];
  }

  protected getTruncatedValue(value: any, length?: number): string {
    if (value === null || value === undefined) return '';
    const strValue = String(value);
    if (!length || strValue.length <= length) {
      return strValue;
    }
    return strValue.substring(0, length) + '...';
  }

  protected shouldShowTooltip(value: any, length?: number): boolean {
    if (value === null || value === undefined) return false;
    return length !== undefined && String(value).length > length;
  }
}

