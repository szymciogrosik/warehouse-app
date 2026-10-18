import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonComponent } from './skeleton.component';
import { Component, signal } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';

@Component({
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    <app-skeleton
      [width]="width()"
      [height]="height()"
      [borderRadius]="borderRadius()"
      [appearance]="appearance()"
    />
  `
})
class TestHostComponent {
  width = signal<string>('100%');
  height = signal<string>('20px');
  borderRadius = signal<string>('4px');
  appearance = signal<'circle' | 'rect'>('rect');
}

describe('SkeletonComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let skeletonEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    skeletonEl = fixture.nativeElement.querySelector('.skeleton-loader');
  });

  it('should render with default rect styles', () => {
    expect(skeletonEl).toBeTruthy();
    expect(skeletonEl.style.width).toBe('100%');
    expect(skeletonEl.style.height).toBe('20px');
    expect(skeletonEl.style.borderRadius).toBe('4px');
  });

  it('should adjust styles when appearance is set to circle', () => {
    host.appearance.set('circle');
    host.width.set('64px');
    fixture.detectChanges();

    expect(skeletonEl.style.width).toBe('64px');
    expect(skeletonEl.style.height).toBe('64px');
    expect(skeletonEl.style.borderRadius).toBe('50%');
  });

  it('should apply custom rectangular dimensions', () => {
    host.appearance.set('rect');
    host.width.set('250px');
    host.height.set('80px');
    host.borderRadius.set('12px');
    fixture.detectChanges();

    expect(skeletonEl.style.width).toBe('250px');
    expect(skeletonEl.style.height).toBe('80px');
    expect(skeletonEl.style.borderRadius).toBe('12px');
  });
});
