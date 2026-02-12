import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [MatIconModule],
  template: `<mat-icon [style.font-size.px]="size" [style.width.px]="size" [style.height.px]="size" [class]="className">{{ materialIconName }}</mat-icon>`,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    mat-icon {
      line-height: 1;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
  @Input() name!: string;
  @Input() size: string | number = 20;
  @Input() className: string = '';

  get materialIconName(): string {
    // Map custom icon names to Material icon names
    const iconMap: Record<string, string> = {
      'add': 'add',
      'note': 'description',
      'calendar': 'event',
      'checkmark': 'check',
      'clock': 'schedule',
      'search': 'search',
      'user': 'person',
      'users': 'group',
      'edit': 'edit',
      'share': 'share',
      'delete': 'delete',
      'information': 'info',
      'arrow-forward': 'arrow_forward',
      'view': 'visibility'
    };
    
    return iconMap[this.name] || this.name;
  }
}
