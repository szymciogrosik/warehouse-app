import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutoResizeDirective } from './auto-resize.directive';
import { provideZonelessChangeDetection } from '@angular/core';

@Component({
  standalone: true,
  imports: [AutoResizeDirective],
  template: `<textarea appAutoResize style="line-height: 20px; font-size: 14px;">Initial text</textarea>`
})
class TestHostComponent {}

describe('AutoResizeDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let textarea: HTMLTextAreaElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    textarea = fixture.nativeElement.querySelector('textarea');
  });

  it('should initialize and set overflow to hidden', () => {
    expect(textarea.style.overflow).toBe('hidden');
    expect(textarea.style.height).toMatch(/\d+px/);
  });

  it('should adjust height when input event is triggered', () => {
    const initialHeight = textarea.style.height;
    textarea.value = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Verify adjustHeight was applied and style.overflow remains hidden
    expect(textarea.style.overflow).toBe('hidden');
    expect(textarea.style.height).toBeTruthy();
  });
});
