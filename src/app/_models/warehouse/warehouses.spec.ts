import { Timestamp } from 'firebase/firestore';
import { WhSharedElem } from './shared/wh-shared-elem';
import { WhItem } from './wh-item';
import { WhBox } from './wh-box';
import { WhRoom } from './wh-room';
import { Warehouse } from './warehouse';
import { Warehouses } from './warehouses';

describe('Warehouse Models', () => {
  describe('WhSharedElem', () => {
    it('should initialize default fields when empty data is provided', () => {
      const elem = new WhSharedElem({});
      expect(elem.name).toBe('');
      expect(elem.description).toBe('');
      expect(elem.createdTimestamp).toBeTruthy();
    });

    it('should preserve provided string timestamp', () => {
      const iso = '2026-01-15T10:30:00.000Z';
      const elem = new WhSharedElem({
        name: 'Test',
        description: 'Desc',
        createdTimestamp: iso
      });
      expect(elem.name).toBe('Test');
      expect(elem.description).toBe('Desc');
      expect(elem.createdTimestamp).toBe(iso);
    });

    it('should normalize Firebase Timestamp instance to ISO string', () => {
      const date = new Date('2026-03-20T12:00:00.000Z');
      const fbTimestamp = Timestamp.fromDate(date);
      const normalized = WhSharedElem.normalizeTimestamp(fbTimestamp);
      expect(normalized).toBe(date.toISOString());
    });

    it('should fallback to current ISO timestamp for unsupported types', () => {
      const normalized = WhSharedElem.normalizeTimestamp(12345);
      expect(typeof normalized).toBe('string');
      expect(normalized.length).toBeGreaterThan(10);
    });
  });

  describe('Warehouses Hierarchy Construction', () => {
    it('should recursively map Warehouses -> Warehouse -> WhRoom -> WhBox -> WhItem', () => {
      const raw = {
        warehouses: [
          {
            name: 'Main Warehouse',
            description: 'Basement',
            createdTimestamp: '2026-01-01T00:00:00.000Z',
            rooms: [
              {
                name: 'Room A',
                description: 'First door',
                createdTimestamp: '2026-01-02T00:00:00.000Z',
                boxes: [
                  {
                    name: 'Box 1',
                    description: 'Top shelf',
                    createdTimestamp: '2026-01-03T00:00:00.000Z',
                    items: [
                      {
                        name: 'Hammer',
                        description: 'Heavy duty',
                        createdTimestamp: '2026-01-04T00:00:00.000Z',
                        updatedTimestamp: '2026-01-05T00:00:00.000Z'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      const warehouses = new Warehouses(raw);
      expect(warehouses.warehouses.length).toBe(1);

      const wh = warehouses.warehouses[0];
      expect(wh instanceof Warehouse).toBeTrue();
      expect(wh.name).toBe('Main Warehouse');
      expect(wh.rooms.length).toBe(1);

      const room = wh.rooms[0];
      expect(room instanceof WhRoom).toBeTrue();
      expect(room.name).toBe('Room A');
      expect(room.boxes.length).toBe(1);

      const box = room.boxes[0];
      expect(box instanceof WhBox).toBeTrue();
      expect(box.name).toBe('Box 1');
      expect(box.items.length).toBe(1);

      const item = box.items[0];
      expect(item instanceof WhItem).toBeTrue();
      expect(item.name).toBe('Hammer');
      expect(item.updatedTimestamp).toBe('2026-01-05T00:00:00.000Z');
    });

    it('should handle missing arrays gracefully', () => {
      const warehouses = new Warehouses({});
      expect(warehouses.warehouses).toEqual([]);

      const wh = new Warehouse({ name: 'Empty WH' });
      expect(wh.rooms).toEqual([]);

      const room = new WhRoom({ name: 'Empty Room' });
      expect(room.boxes).toEqual([]);

      const box = new WhBox({ name: 'Empty Box' });
      expect(box.items).toEqual([]);
    });
  });
});
