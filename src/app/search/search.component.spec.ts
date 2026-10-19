import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { SearchComponent } from './search.component';
import { WarehouseDbService } from '../_database/warehouse/warehouse.service';
import { AuthService } from '../_services/auth/auth.service';
import { CustomTranslateService } from '../_services/translate/custom-translate.service';
import { DateService } from '../_services/util/date.service';
import { WarehouseNavigationService } from '../_services/warehouse/warehouse-navigation.service';
import { Warehouses } from '../_models/warehouse/warehouses';
import { RedirectionEnum } from '../../utils/redirection.enum';
import { VaultService } from '../_services/security/vault.service';
import { signal } from '@angular/core';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let mockWarehouseDb: jasmine.SpyObj<WarehouseDbService>;
  let mockAuthService: any;
  let mockTranslateService: jasmine.SpyObj<CustomTranslateService>;
  let mockDateService: jasmine.SpyObj<DateService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let navService: WarehouseNavigationService;
  let warehousesSubject: BehaviorSubject<Warehouses | null>;

  const createTestWarehouses = (): Warehouses =>
    new Warehouses({
      warehouses: [
        {
          name: 'Garage',
          description: '',
          createdTimestamp: '2026-01-01T00:00:00.000Z',
          rooms: [
            {
              name: 'Workshop',
              description: '',
              createdTimestamp: '2026-01-01T00:00:00.000Z',
              boxes: [
                {
                  name: 'Toolbox',
                  description: '',
                  createdTimestamp: '2026-01-01T00:00:00.000Z',
                  items: [
                    {
                      name: 'Cordless Drill',
                      description: '18V Makita',
                      createdTimestamp: '2026-01-02T10:00:00.000Z',
                      updatedTimestamp: '2026-01-03T10:00:00.000Z'
                    },
                    {
                      name: 'Soldering Iron',
                      description: '60W Electronics',
                      createdTimestamp: '2026-01-04T10:00:00.000Z',
                      updatedTimestamp: '2026-01-05T10:00:00.000Z'
                    }
                  ]
                }
              ]
            },
            {
              name: 'Garden Corner',
              description: '',
              createdTimestamp: '2026-01-01T00:00:00.000Z',
              boxes: [
                {
                  name: 'Green Bin',
                  description: '',
                  createdTimestamp: '2026-01-01T00:00:00.000Z',
                  items: [
                    {
                      name: 'Garden Hose',
                      description: '25m flexible',
                      createdTimestamp: '2026-01-06T10:00:00.000Z',
                      updatedTimestamp: '2026-01-07T10:00:00.000Z'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

  beforeEach(async () => {
    warehousesSubject = new BehaviorSubject<Warehouses | null>(createTestWarehouses());

    mockWarehouseDb = jasmine.createSpyObj('WarehouseDbService', ['getByUser', 'save']);
    mockWarehouseDb.getByUser.and.returnValue(warehousesSubject.asObservable());
    mockWarehouseDb.save.and.returnValue(Promise.resolve());

    mockAuthService = {
      loggedUser: () => of({ uid: 'user-123' })
    };

    mockTranslateService = jasmine.createSpyObj('CustomTranslateService', ['get']);
    mockTranslateService.get.and.callFake((key: string) => key);

    mockDateService = jasmine.createSpyObj('DateService', ['presentDateTime']);
    mockDateService.presentDateTime.and.returnValue('2026-01-01 10:00');

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [SearchComponent, NoopAnimationsModule],
      providers: [
        provideTranslateService(),
        { provide: WarehouseDbService, useValue: mockWarehouseDb },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CustomTranslateService, useValue: mockTranslateService },
        { provide: DateService, useValue: mockDateService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        {
          provide: VaultService,
          useValue: {
            status: signal('UNLOCKED'),
            isUnlocked: signal(true),
            hasPin: signal(true),
            isConfigured: signal(true)
          }
        }
      ]
    })
      .overrideComponent(SearchComponent, {
        add: { providers: [{ provide: MatDialog, useValue: mockDialog }] }
      })
      .compileComponents();

    navService = TestBed.inject(WarehouseNavigationService);
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and immediately populate filteredItems signal upon initialization', () => {
    expect(component).toBeTruthy();
    const items = (component as any).filteredItems();
    expect(items.length).toBe(3);
    expect(items.map((i: any) => i.name)).toEqual(['Cordless Drill', 'Soldering Iron', 'Garden Hose']);

    const rooms = (component as any).availableRooms();
    expect(rooms.length).toBe(1);
    expect(rooms[0].rooms.length).toBe(2);
  });

  it('should filter items by text input across name, description, and location', () => {
    const fakeEvent = { target: { value: 'makita' } } as unknown as Event;
    (component as any).applyFilter(fakeEvent);

    const items = (component as any).filteredItems();
    expect(items.length).toBe(1);
    expect(items[0].name).toBe('Cordless Drill');
  });

  it('should filter items by selectedRooms and preserve text filter simultaneously', () => {
    // Filter by room 'Garage → Workshop'
    (component as any).selectedRooms = ['Garage → Workshop'];
    (component as any).applyFilter();

    expect((component as any).filteredItems().length).toBe(2);

    // Now also apply text filter 'soldering'
    const fakeEvent = { target: { value: 'soldering' } } as unknown as Event;
    (component as any).applyFilter(fakeEvent);

    expect((component as any).filteredItems().length).toBe(1);
    expect((component as any).filteredItems()[0].name).toBe('Soldering Iron');

    // Changing room selection without passing event should still keep 'soldering' text filter
    (component as any).selectedRooms = ['Garage → Workshop', 'Garage → Garden Corner'];
    (component as any).applyFilter();

    expect((component as any).filteredItems().length).toBe(1);
    expect((component as any).filteredItems()[0].name).toBe('Soldering Iron');
  });

  it('should return empty list when no rooms are selected', () => {
    (component as any).selectedRooms = [];
    (component as any).applyFilter();

    expect((component as any).filteredItems().length).toBe(0);
  });

  it('should set navigation target and navigate to HOME on navigateToBox()', () => {
    const row = (component as any).filteredItems()[2]; // Garden Hose in room 1, box 0
    (component as any).navigateToBox(row);

    expect(navService.consumeTarget()).toEqual({
      warehouseIndex: 0,
      roomIndex: 1,
      boxIndex: 0
    });
    expect(mockRouter.navigate).toHaveBeenCalledWith([RedirectionEnum.HOME]);
  });

  it('should remove item when confirmed in removeItem()', async () => {
    mockDialog.open.and.returnValue({ afterClosed: () => of(true) } as any);
    const row = (component as any).filteredItems()[0]; // Cordless Drill

    await (component as any).removeItem(row);

    const remainingItems = (component as any).warehouses.warehouses[0].rooms[0].boxes[0].items;
    expect(remainingItems.length).toBe(1);
    expect(remainingItems[0].name).toBe('Soldering Iron');
    expect(mockWarehouseDb.save).toHaveBeenCalled();
  });

  it('should edit and move item to another box in editItem()', async () => {
    mockDialog.open.and.returnValue({
      afterClosed: () =>
        of({
          name: 'Updated Drill',
          description: 'Moved to Garden Bin',
          targetBoxIndex: { warehouse: 0, room: 1, box: 0 }
        })
    } as any);

    const row = (component as any).filteredItems()[0]; // Cordless Drill
    await (component as any).editItem(row);

    const workshopBoxItems = (component as any).warehouses.warehouses[0].rooms[0].boxes[0].items;
    const gardenBoxItems = (component as any).warehouses.warehouses[0].rooms[1].boxes[0].items;

    expect(workshopBoxItems.length).toBe(1);
    expect(gardenBoxItems.length).toBe(2);
    expect(gardenBoxItems[1].name).toBe('Updated Drill');
    expect(mockWarehouseDb.save).toHaveBeenCalled();
  });
});
