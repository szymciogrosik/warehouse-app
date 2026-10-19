import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { WarehouseDbService } from './warehouse.service';
import { Warehouses } from '../../_models/warehouse/warehouses';

import { VaultService } from '../../_services/security/vault.service';
import { of } from 'rxjs';

describe('WarehouseDbService', () => {
  let service: WarehouseDbService;

  beforeEach(() => {
    const mockVault = {
      isUnlocked: jasmine.createSpy('isUnlocked').and.returnValue(false),
      onVaultStateChanged$: of(false)
    };

    TestBed.configureTestingModule({
      providers: [
        WarehouseDbService,
        { provide: Firestore, useValue: {} },
        { provide: VaultService, useValue: mockVault }
      ]
    });
    service = TestBed.inject(WarehouseDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('sortAll', () => {
    it('should sort warehouses, rooms, boxes, and items alphabetically (case-insensitive)', () => {
      const unsorted = new Warehouses({
        warehouses: [
          {
            name: 'Zeta Warehouse',
            createdTimestamp: '2026-01-01T00:00:00.000Z',
            rooms: []
          },
          {
            name: 'alpha Warehouse',
            createdTimestamp: '2026-01-01T00:00:00.000Z',
            rooms: [
              {
                name: 'Room C',
                createdTimestamp: '2026-01-01T00:00:00.000Z',
                boxes: []
              },
              {
                name: 'room A',
                createdTimestamp: '2026-01-01T00:00:00.000Z',
                boxes: [
                  {
                    name: 'Box 2',
                    createdTimestamp: '2026-01-01T00:00:00.000Z',
                    items: []
                  },
                  {
                    name: 'box 1',
                    createdTimestamp: '2026-01-01T00:00:00.000Z',
                    items: [
                      {
                        name: 'Wrench',
                        createdTimestamp: '2026-01-01T00:00:00.000Z',
                        updatedTimestamp: '2026-01-01T00:00:00.000Z'
                      },
                      {
                        name: 'drill',
                        createdTimestamp: '2026-01-01T00:00:00.000Z',
                        updatedTimestamp: '2026-01-01T00:00:00.000Z'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });

      (service as any).sortAll(unsorted);

      expect(unsorted.warehouses.map(w => w.name)).toEqual(['alpha Warehouse', 'Zeta Warehouse']);
      const alphaRooms = unsorted.warehouses[0].rooms;
      expect(alphaRooms.map(r => r.name)).toEqual(['room A', 'Room C']);
      const roomABoxes = alphaRooms[0].boxes;
      expect(roomABoxes.map(b => b.name)).toEqual(['box 1', 'Box 2']);
      const box1Items = roomABoxes[0].items;
      expect(box1Items.map(i => i.name)).toEqual(['drill', 'Wrench']);
    });
  });
});
