import {AfterViewInit, ChangeDetectorRef, Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[appAutoResize]'
})
export class AutoResizeDirective implements AfterViewInit {

  @HostListener('input', ['$event.target'])
  onInput(textArea: HTMLTextAreaElement): void {
    this.adjustHeight();
  }

  constructor(private el: ElementRef<HTMLTextAreaElement>, private cdr: ChangeDetectorRef) {}

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
