import { TestBed } from '@angular/core/testing';
import { DateService } from './date.service';
import { DateTime } from 'luxon';

describe('DateService', () => {
  let service: DateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DateService]
    });
    service = TestBed.inject(DateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return DateTime in Europe/Warsaw timezone', () => {
    const now = service.getCurrentDateTime();
    expect(now.zoneName).toBe('Europe/Warsaw');
    expect(now.isValid).toBe(true);
  });

  it('should format presentDateTime properly', () => {
    const dt = DateTime.fromObject({ year: 2026, month: 5, day: 15, hour: 14, minute: 30, second: 45 });
    expect(service.presentDateTime(dt)).toBe('15.05.2026 14:30:45');
  });

  it('should format presentDate properly', () => {
    const dt = DateTime.fromObject({ year: 2026, month: 12, day: 31 });
    expect(service.presentDate(dt)).toBe('31.12.2026');
  });

  it('should return valid string format for presentCurrentDateTime', () => {
    const result = service.presentCurrentDateTime();
    // Format: dd.MM.yyyy HH:mm:ss
    expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2}$/);
  });

  it('should return valid string format for presentCurrentDate', () => {
    const result = service.presentCurrentDate();
    // Format: dd.MM.yyyy
    expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
  });

  it('should return valid file-safe format for presentCurrentDateTimeForFileName', () => {
    const result = service.presentCurrentDateTimeForFileName();
    // Format: dd-MM-yyyy_HH-mm-ss
    expect(result).toMatch(/^\d{2}-\d{2}-\d{4}_\d{2}-\d{2}-\d{2}$/);
    expect(result).not.toContain(':');
    expect(result).not.toContain(' ');
  });
});
