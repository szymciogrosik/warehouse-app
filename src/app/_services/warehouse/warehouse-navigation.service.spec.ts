import { TestBed } from '@angular/core/testing';
import { WarehouseNavigationService, WarehouseNavigationTarget } from './warehouse-navigation.service';
import { firstValueFrom } from 'rxjs';

describe('WarehouseNavigationService', () => {
  let service: WarehouseNavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WarehouseNavigationService);
  });

  it('should be created with initial null target', async () => {
    expect(service).toBeTruthy();
    const initial = await firstValueFrom(service.target$);
    expect(initial).toBeNull();
    expect(service.consumeTarget()).toBeNull();
  });

  it('should set and emit navigation target', async () => {
    const target: WarehouseNavigationTarget = {
      warehouseIndex: 1,
      roomIndex: 2,
      boxIndex: 3
    };

    service.setTarget(target);

    const emitted = await firstValueFrom(service.target$);
    expect(emitted).toEqual(target);
  });

  it('should return target on consumeTarget() and clear it afterwards', async () => {
    const target: WarehouseNavigationTarget = {
      warehouseIndex: 0,
      roomIndex: 1,
      boxIndex: 0
    };

    service.setTarget(target);

    const consumed = service.consumeTarget();
    expect(consumed).toEqual(target);

    // Subsequent call should return null
    expect(service.consumeTarget()).toBeNull();
    const afterConsume = await firstValueFrom(service.target$);
    expect(afterConsume).toBeNull();
  });
});
