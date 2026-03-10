import {AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild,} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {SmartTableColumn} from './smart-table.model';
import {TranslateModule} from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-smart-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './smart-table.component.html',
  styleUrl: './smart-table.component.scss',
})
export class SmartTableComponent<T> implements OnChanges, AfterViewInit {
  @Input() data: T[] = [];
  @Input() columns: SmartTableColumn<T>[] = [];
  @Input() filterPlaceholderKey: string = 'admin.panel.table.filter.placeholder';
  @Input() headerAction?: {
    icon: string;
    tooltipKey: string;
    color?: 'primary' | 'accent' | 'warn';
    onClick: () => void;
  };

  protected dataSource = new MatTableDataSource<T>([]);
  protected displayedColumns: string[] = [];

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  @ViewChild(MatSort) set sort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.dataSource.data = this.data;
    }
    if (changes['columns'] && this.columns) {
      this.displayedColumns = this.columns.map((col) => col.key);
    }
  }

  ngAfterViewInit(): void {
    // Default sorting logic for nested objects if needed, but defaults are usually fine
    this.dataSource.sortingDataAccessor = (item: T, property: string) => {
      const column = this.columns.find(c => c.key === property);
      if (column && column.valueFn) {
        return column.valueFn(item);
      }
      return (item as any)[property];
    };
  }

  protected applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
