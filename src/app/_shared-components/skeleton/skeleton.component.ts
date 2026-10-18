import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonComponent {
  width = input<string>('100%');
  height = input<string>('20px');
  borderRadius = input<string>('4px');
  appearance = input<'circle' | 'rect'>('rect');

  protected styles = computed(() => {
    const isCircle = this.appearance() === 'circle';
    return {
      'width': this.width(),
      'height': isCircle ? this.width() : this.height(),
      'border-radius': isCircle ? '50%' : this.borderRadius()
    };
  });
}
