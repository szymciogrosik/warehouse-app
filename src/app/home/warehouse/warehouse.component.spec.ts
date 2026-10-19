import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { provideTranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { WarehouseViewComponent } from './warehouse.component';
import { WarehouseDbService } from '../../_database/warehouse/warehouse.service';
import { AuthService } from '../../_services/auth/auth.service';
import { CustomTranslateService } from '../../_services/translate/custom-translate.service';
import { DateService } from '../../_services/util/date.service';
import { WarehouseNavigationService } from '../../_services/warehouse/warehouse-navigation.service';
import { Warehouses } from '../../_models/warehouse/warehouses';
import { VaultService } from '../../_services/security/vault.service';
import { signal } from '@angular/core';

describe('WarehouseViewComponent', () => {
  let component: WarehouseViewComponent;
  let fixture: ComponentFixture<WarehouseViewComponent>;
  let mockWarehouseDb: jasmine.SpyObj<WarehouseDbService>;
  let mockAuthService: any;
  let mockTranslateService: jasmine.SpyObj<CustomTranslateService>;
  let mockDateService: jasmine.SpyObj<DateService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let navService: WarehouseNavigationService;
  let warehousesSubject: BehaviorSubject<Warehouses | null>;

  const createSampleWarehouses = (singlePath = false): Warehouses => {
    if (singlePath) {
      return new Warehouses({
        warehouses: [
          {
            name: 'Home Garage',
            description: 'Main storage',
            createdTimestamp: '2026-01-01T10:00:00.000Z',
            rooms: [
              {
                name: 'Shelf 1',
                description: 'Left wall',
                createdTimestamp: '2026-01-02T10:00:00.000Z',
                boxes: [
                  {
                    name: 'Red Box',
                    description: 'Electronics',
                    createdTimestamp: '2026-01-03T10:00:00.000Z',
                    items: [
                      {
                        name: 'Multimeter',
                        description: 'Digital',
                        createdTimestamp: '2026-01-04T10:00:00.000Z',
                        updatedTimestamp: '2026-01-05T10:00:00.000Z'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });
    }

    return new Warehouses({
      warehouses: [
        {
          name: 'Warehouse A',
          description: 'First',
          createdTimestamp: '2026-01-01T10:00:00.000Z',
          rooms: [
            {
              name: 'Room A1',
              description: '',
              createdTimestamp: '2026-01-02T10:00:00.000Z',
              boxes: [
                {
                  name: 'Box A1-1',
                  description: '',
                  createdTimestamp: '2026-01-03T10:00:00.000Z',
                  items: [
                    {
                      name: 'Item 1',
                      description: 'Desc 1',
                      createdTimestamp: '2026-01-04T10:00:00.000Z',
                      updatedTimestamp: '2026-01-06T10:00:00.000Z'
                    }
                  ]
                }
              ]
            },
            {
              name: 'Room A2',
              description: '',
              createdTimestamp: '2026-01-02T12:00:00.000Z',
              boxes: []
            }
          ]
        },
        {
          name: 'Warehouse B',
          description: 'Second',
          createdTimestamp: '2026-01-01T12:00:00.000Z',
          rooms: []
        }
      ]
    });
  };

  beforeEach(async () => {
    warehousesSubject = new BehaviorSubject<Warehouses | null>(createSampleWarehouses(false));

    mockWarehouseDb = jasmine.createSpyObj('WarehouseDbService', ['getByUser', 'save', 'delete']);
    mockWarehouseDb.getByUser.and.returnValue(warehousesSubject.asObservable());
    mockWarehouseDb.save.and.returnValue(Promise.resolve());

    mockAuthService = {
      loggedUser: () => of({ uid: 'user-123' })
    };

    mockTranslateService = jasmine.createSpyObj('CustomTranslateService', ['get']);
    mockTranslateService.get.and.callFake((key: string) => key);

    mockDateService = jasmine.createSpyObj('DateService', ['presentDateTime']);
    mockDateService.presentDateTime.and.returnValue('2026-01-01 10:00');

    mockDialog = jasmine.createSpyObj('MatDialog', ['open'], {
      openDialogs: []
    });
    mockDialog.open.and.returnValue({ afterClosed: () => of(true) } as any);

    const mockVaultService = {
      status: signal('UNLOCKED'),
      isUnlocked: signal(true),
      hasPin: signal(true),
      isConfigured: signal(true),
      lockVault: jasmine.createSpy('lockVault'),
      metadataLoaded$: of(true),
      onVaultStateChanged$: of(false),
      isAutoUnlocking: signal(false),
      shouldPromptUnlock: jasmine.createSpy('shouldPromptUnlock').and.returnValue(false),
      markUnlockPrompted: jasmine.createSpy('markUnlockPrompted'),
      shouldPromptPinSetup: jasmine.createSpy('shouldPromptPinSetup').and.returnValue(false),
      markPinPrompted: jasmine.createSpy('markPinPrompted'),
      consumePendingRecoveryKey: jasmine.createSpy('consumePendingRecoveryKey').and.returnValue(null)
    };

    await TestBed.configureTestingModule({
      imports: [WarehouseViewComponent, NoopAnimationsModule],
      providers: [
        provideTranslateService(),
        { provide: WarehouseDbService, useValue: mockWarehouseDb },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CustomTranslateService, useValue: mockTranslateService },
        { provide: DateService, useValue: mockDateService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: VaultService, useValue: mockVaultService }
      ]
    })
      .overrideComponent(WarehouseViewComponent, {
        add: { providers: [{ provide: MatDialog, useValue: mockDialog }] }
      })
      .compileComponents();

    navService = TestBed.inject(WarehouseNavigationService);
    fixture = TestBed.createComponent(WarehouseViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load user warehouses at viewLevel 0 when multiple warehouses exist', () => {
    expect(component).toBeTruthy();
    expect(component.userUid).toBe('user-123');
    expect(component.viewLevel).toBe(0);
    expect(component.currentWarehouses?.warehouses.length).toBe(2);
    expect(component.getNavTitle()).toBe('confirmation.dialog.warehouses');
  });

  it('should auto-drill down to items (viewLevel 3) on first load if there is only 1 warehouse, 1 room, and 1 box', () => {
    warehousesSubject.next(createSampleWarehouses(true));
    const singleFixture = TestBed.createComponent(WarehouseViewComponent);
    const singleComp = singleFixture.componentInstance;
    singleFixture.detectChanges();

    expect(singleComp.viewLevel).toBe(3);
    expect(singleComp.selectedWarehouseIndex).toBe(0);
    expect(singleComp.selectedRoomIndex).toBe(0);
    expect(singleComp.selectedBoxIndex).toBe(0);
    expect(singleComp.getNavTitle()).toBe('Red Box');
  });

  it('should jump directly to target box when WarehouseNavigationService has a target', () => {
    navService.setTarget({ warehouseIndex: 0, roomIndex: 0, boxIndex: 0 });

    const navFixture = TestBed.createComponent(WarehouseViewComponent);
    const navComp = navFixture.componentInstance;
    navFixture.detectChanges();

    expect(navComp.viewLevel).toBe(3);
    expect(navComp.selectedWarehouseIndex).toBe(0);
    expect(navComp.selectedRoomIndex).toBe(0);
    expect(navComp.selectedBoxIndex).toBe(0);
    expect(navService.consumeTarget()).toBeNull();
  });

  describe('Hierarchy Navigation', () => {
    it('should navigate forward through warehouse -> room -> box and back', () => {
      component.enterWarehouse(0);
      expect(component.viewLevel).toBe(1);
      expect(component.selectedWarehouseIndex).toBe(0);
      expect(component.getNavTitle()).toBe('Warehouse A');

      component.enterRoom(0);
      expect(component.viewLevel).toBe(2);
      expect(component.selectedRoomIndex).toBe(0);
      expect(component.getNavTitle()).toBe('Room A1');

      component.enterBox(0);
      expect(component.viewLevel).toBe(3);
      expect(component.selectedBoxIndex).toBe(0);
      expect(component.getNavTitle()).toBe('Box A1-1');

      component.goBack();
      expect(component.viewLevel).toBe(2);
      expect(component.selectedBoxIndex).toBeNull();

      component.goBack();
      expect(component.viewLevel).toBe(1);
      expect(component.selectedRoomIndex).toBeNull();

      component.goBack();
      expect(component.viewLevel).toBe(0);
      expect(component.selectedWarehouseIndex).toBeNull();
    });
  });

  describe('Adding Elements', () => {
    it('should add a new warehouse at viewLevel 0 and save to Firestore', async () => {
      (component as any).openEditDialog = jasmine.createSpy().and.returnValue(
        Promise.resolve({ name: 'Warehouse C', description: 'Third' })
      );

      await (component as any).add();

      expect(component.currentWarehouses?.warehouses.length).toBe(3);
      expect(component.currentWarehouses?.warehouses[2].name).toBe('Warehouse C');
      expect(mockWarehouseDb.save).toHaveBeenCalled();
    });

    it('should add a new room at viewLevel 1 and save to Firestore', async () => {
      component.enterWarehouse(0);
      (component as any).openEditDialog = jasmine.createSpy().and.returnValue(
        Promise.resolve({ name: 'Room A3', description: 'Attic' })
      );

      await (component as any).add();

      expect(component.currentWarehouses?.warehouses[0].rooms.length).toBe(3);
      expect(component.currentWarehouses?.warehouses[0].rooms[2].name).toBe('Room A3');
      expect(mockWarehouseDb.save).toHaveBeenCalled();
    });

    it('should add a new box at viewLevel 2 and save to Firestore', async () => {
      component.enterWarehouse(0);
      component.enterRoom(0);
      (component as any).openEditDialog = jasmine.createSpy().and.returnValue(
        Promise.resolve({ name: 'Box A1-2', description: 'Bottom shelf' })
      );

      await (component as any).add();

      expect(component.currentWarehouses?.warehouses[0].rooms[0].boxes.length).toBe(2);
      expect(component.currentWarehouses?.warehouses[0].rooms[0].boxes[1].name).toBe('Box A1-2');
      expect(mockWarehouseDb.save).toHaveBeenCalled();
    });

    it('should add a new item at viewLevel 3 and save to Firestore', async () => {
      component.enterWarehouse(0);
      component.enterRoom(0);
      component.enterBox(0);
      (component as any).openEditDialog = jasmine.createSpy().and.returnValue(
        Promise.resolve({ name: 'Screwdriver', description: 'Phillips' })
      );

      await (component as any).add();

      const items = component.currentWarehouses?.warehouses[0].rooms[0].boxes[0].items;
      expect(items?.length).toBe(2);
      expect(items?.[1].name).toBe('Screwdriver');
      expect(mockWarehouseDb.save).toHaveBeenCalled();
    });
  });

  describe('Editing & Moving Elements', () => {
    it('should edit box and move it to another room when targetRoomIndex changes', async () => {
      component.enterWarehouse(0);
      component.enterRoom(0);
      component.enterBox(0);

      (component as any).openEditDialog = jasmine.createSpy().and.returnValue(
        Promise.resolve({
          name: 'Moved Box',
          description: 'Relocated',
          targetRoomIndex: { warehouse: 0, room: 1 }
        })
      );

      await (component as any).edit();

      expect(component.currentWarehouses?.warehouses[0].rooms[0].boxes.length).toBe(0);
      expect(component.currentWarehouses?.warehouses[0].rooms[1].boxes.length).toBe(1);
      expect(component.currentWarehouses?.warehouses[0].rooms[1].boxes[0].name).toBe('Moved Box');
      expect(component.viewLevel).toBe(2);
      expect(component.selectedBoxIndex).toBeNull();
      expect(mockWarehouseDb.save).toHaveBeenCalled();
    });

    it('should edit item and move it to another box when targetBoxIndex changes', async () => {
      // Add a box to Room A2 first
      component.currentWarehouses!.warehouses[0].rooms[1].boxes.push({
        name: 'Target Box',
        description: '',
        createdTimestamp: '2026-01-03T10:00:00.000Z',
        items: []
      });

      component.enterWarehouse(0);
      component.enterRoom(0);
      component.enterBox(0);

      (component as any).openEditDialog = jasmine.createSpy().and.returnValue(
        Promise.resolve({
          name: 'Renamed Item',
          description: 'Updated Desc',
          targetBoxIndex: { warehouse: 0, room: 1, box: 0 }
        })
      );

      await (component as any).editItem(0);

      expect(component.currentWarehouses?.warehouses[0].rooms[0].boxes[0].items.length).toBe(0);
      expect(component.currentWarehouses?.warehouses[0].rooms[1].boxes[0].items.length).toBe(1);
      expect(component.currentWarehouses?.warehouses[0].rooms[1].boxes[0].items[0].name).toBe('Renamed Item');
      expect(mockWarehouseDb.save).toHaveBeenCalled();
    });
  });

  describe('Deleting Elements', () => {
    it('should remove an item when confirmed', async () => {
      mockDialog.open.and.returnValue({ afterClosed: () => of(true) } as any);
      component.enterWarehouse(0);
      component.enterRoom(0);
      component.enterBox(0);

      await (component as any).removeItem(0);

      expect(component.currentWarehouses?.warehouses[0].rooms[0].boxes[0].items.length).toBe(0);
      expect(mockWarehouseDb.save).toHaveBeenCalled();
    });

    it('should not remove an item when confirmation dialog is cancelled', async () => {
      mockDialog.open.and.returnValue({ afterClosed: () => of(false) } as any);
      component.enterWarehouse(0);
      component.enterRoom(0);
      component.enterBox(0);

      await (component as any).removeItem(0);

      expect(component.currentWarehouses?.warehouses[0].rooms[0].boxes[0].items.length).toBe(1);
      expect(mockWarehouseDb.save).not.toHaveBeenCalled();
    });

    it('should remove a box at viewLevel 3 and return to viewLevel 2', async () => {
      mockDialog.open.and.returnValue({ afterClosed: () => of(true) } as any);
      component.enterWarehouse(0);
      component.enterRoom(0);
      component.enterBox(0);

      await (component as any).remove();

      expect(component.currentWarehouses?.warehouses[0].rooms[0].boxes.length).toBe(0);
      expect(component.viewLevel).toBe(2);
      expect(component.selectedBoxIndex).toBeNull();
      expect(mockWarehouseDb.save).toHaveBeenCalled();
    });
  });

  describe('Timestamp Calculation Helpers', () => {
    it('should return latest item updatedTimestamp for box, room, and warehouse', () => {
      const wh = component.currentWarehouses!.warehouses[0];
      expect(component.getLastModificationTimestampForWarehouse(wh)).toBe('2026-01-06T10:00:00.000Z');
      expect(component.getLastModificationTimestampForRoom(wh.rooms[0])).toBe('2026-01-06T10:00:00.000Z');
      expect(component.getLastModificationTimestampForBox(wh.rooms[0].boxes[0])).toBe('2026-01-06T10:00:00.000Z');
    });

    it('should fallback to createdTimestamp if warehouse or room has no items', () => {
      const emptyWh = component.currentWarehouses!.warehouses[1];
      expect(component.getLastModificationTimestampForWarehouse(emptyWh)).toBe('2026-01-01T12:00:00.000Z');
    });
  });

  describe('Vault Onboarding Checks', () => {
    it('should prompt PIN setup when shouldPromptPinSetup is true', async () => {
      const vaultSvc = TestBed.inject(VaultService) as any;
      vaultSvc.shouldPromptPinSetup.and.returnValue(true);

      await (component as any).checkVaultOnboarding();

      expect(vaultSvc.markPinPrompted).toHaveBeenCalled();
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should prompt unlock dialog when shouldPromptUnlock is true', async () => {
      const vaultSvc = TestBed.inject(VaultService) as any;
      vaultSvc.shouldPromptUnlock.and.returnValue(true);

      await (component as any).checkVaultOnboarding();

      expect(vaultSvc.markUnlockPrompted).toHaveBeenCalled();
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should display recovery key dialog if a recovery key is pending after PIN dialog closes', async () => {
      const vaultSvc = TestBed.inject(VaultService) as any;
      vaultSvc.shouldPromptPinSetup.and.returnValue(true);
      vaultSvc.consumePendingRecoveryKey.and.returnValue('WMS-ABCD-EFGH-1234-5678');

      await (component as any).checkVaultOnboarding();

      expect(mockDialog.open).toHaveBeenCalledTimes(2);
    });
  });
});

