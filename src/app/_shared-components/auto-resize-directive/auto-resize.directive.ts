import {AfterViewInit, ChangeDetectorRef, Directive, ElementRef, HostListener, inject} from '@angular/core';

@Directive({
  selector: '[appAutoResize]',
  standalone: true
})
export class AutoResizeDirective implements AfterViewInit {

  @HostListener('input')
  onInput(): void {
    this.adjustHeight();
  }

  private el = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    this.adjustHeight();
  }

  private adjustHeight(): void {
    const textarea = this.el.nativeElement;
    textarea.style.overflow = 'hidden';
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}
