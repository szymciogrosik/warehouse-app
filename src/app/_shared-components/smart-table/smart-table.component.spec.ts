import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SmartTableComponent } from './smart-table.component';
import { provideTranslateService } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SmartTableColumn } from './smart-table.model';

interface TestItem {
  id: string;
  name: string;
  email: string;
}

describe('SmartTableComponent', () => {
  let component: SmartTableComponent<TestItem>;
  let fixture: ComponentFixture<SmartTableComponent<TestItem>>;

  const mockColumns: SmartTableColumn<TestItem>[] = [
    { key: 'name', headerLabelKey: 'Name', type: 'text' },
    { key: 'email', headerLabelKey: 'Email', type: 'text' }
  ];

  const mockData: TestItem[] = [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartTableComponent, NoopAnimationsModule],
      providers: [provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(SmartTableComponent<TestItem>);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('columns', mockColumns);
    fixture.componentRef.setInput('data', mockData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute displayedColumns based on columns input', () => {
    const displayed = (component as any).displayedColumns();
    expect(displayed).toEqual(['name', 'email']);
  });

  it('should filter data properly', () => {
    component.ngAfterViewInit();

    const event = { target: { value: 'alice' } } as unknown as Event;
    (component as any).applyFilter(event);

    const filtered = (component as any).dataSource.filteredData;
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Alice');
  });

  it('should correctly truncate values when length is exceeded', () => {
    const truncated = (component as any).getTruncatedValue('A very long text to display', 10);
    expect(truncated).toBe('A very lon...');

    const notTruncated = (component as any).getTruncatedValue('Short text', 20);
    expect(notTruncated).toBe('Short text');
  });
});
