import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `<span [innerHTML]="svgContent" [class]="className"></span>`,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    :host ::ng-deep svg {
      width: 1em;
      height: 1em;
      fill: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
  @Input() name!: string;
  @Input() size: string = '20';
  @Input() color: string = 'currentColor';
  @Input() className: string = '';

  constructor(private sanitizer: DomSanitizer) {}

  get svgContent(): SafeHtml {
    const paths = this.getIconPaths(this.name);
    if (!paths || paths.length === 0) {
      return '';
    }

    let pathElements = '';
    for (const [element, attrs] of paths) {
      const attrString = Object.entries(attrs as Record<string, string>)
        .map(([key, value]) => {
          const attr = key === 'strokeWidth' ? 'stroke-width' : 
                       key === 'strokeLinecap' ? 'stroke-linecap' : 
                       key === 'strokeLinejoin' ? 'stroke-linejoin' : key;
          return `${attr}="${value === 'currentColor' ? this.color : value}"`;
        })
        .join(' ');
      pathElements += `<${element} ${attrString}/>`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${this.size}" height="${this.size}">${pathElements}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  private getIconPaths(name: string): any[] {
    // Import icons dynamically
    switch (name) {
      case 'add': return [["path", { d: "M12.001 5.00003V19.002", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5" }],["path", { d: "M19.002 12.002L4.99998 12.002", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5" }]];
      case 'note': return [["path", { d: "M20.002 11.9997V7.49968C20.002 4.73825 20.002 3.35754 19.123 2.4788C18.2443 1.60007 16.8636 1.60007 14.1021 1.60007H9.90197C7.14054 1.60007 5.75983 1.60007 4.88109 2.4788C4.00236 3.35754 4.00236 4.73825 4.00236 7.49968V16.4997C4.00236 19.2611 4.00236 20.6418 4.88109 21.5206C5.75983 22.3993 7.14054 22.3993 9.90197 22.3993H11.002", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }],["path", { d: "M14.001 22L15.5 22.5C16 22.7 16.5 22.8 17.001 22.9C17.501 23 18.001 23 18.501 22.9C19.001 22.8 19.501 22.6 19.901 22.3C20.301 22 20.701 21.6 20.901 21.1C21.101 20.6 21.201 20.1 21.201 19.5V15C21.201 14.4 21.101 13.9 20.901 13.4C20.701 12.9 20.301 12.5 19.901 12.2C19.501 11.9 19.001 11.7 18.501 11.6C18.001 11.5 17.501 11.5 17.001 11.6C16.501 11.7 16.001 11.8 15.501 12L14.001 12.5V22Z", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }],["path", { d: "M8 7H15", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }],["path", { d: "M8 11H11", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }]];
      case 'calendar': return [["path", { d: "M18 2V4M6 2V4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }],["path", { d: "M11.9955 13H12.0045M11.9955 17H12.0045M15.991 13H16M8 13H8.00897M8 17H8.00897", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }],["path", { d: "M3.5 8H20.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }],["path", { d: "M2.5 12.2432C2.5 7.88594 2.5 5.70728 3.75212 4.35364C5.00424 3 7.01949 3 11.05 3H12.95C16.9805 3 18.9958 3 20.2479 4.35364C21.5 5.70728 21.5 7.88594 21.5 12.2432V12.7568C21.5 17.1141 21.5 19.2927 20.2479 20.6464C18.9958 22 16.9805 22 12.95 22H11.05C7.01949 22 5.00424 22 3.75212 20.6464C2.5 19.2927 2.5 17.1141 2.5 12.7568V12.2432Z", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }]];
      case 'checkmark': return [["path", { d: "M5 14L8.5 17.5L19 6.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }]];
      case 'clock': return [["circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "1.5" }],["path", { d: "M12 8V12L14 14", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }]];
      case 'search': return [["circle", { cx: "11.5", cy: "11.5", r: "9.5", stroke: "currentColor", strokeWidth: "1.5" }],["path", { d: "M18.5 18.5L22 22", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }]];
      case 'user': return [["circle", { cx: "12", cy: "7", r: "4", stroke: "currentColor", strokeWidth: "1.5" }],["path", { d: "M4 18C4 15.7909 5.79086 14 8 14H16C18.2091 14 20 15.7909 20 18V21H4V18Z", stroke: "currentColor", strokeWidth: "1.5" }]];
      case 'users': return [["circle", { cx: "9", cy: "7", r: "4", stroke: "currentColor", strokeWidth: "1.5" }],["path", { d: "M2 18C2 15.7909 3.79086 14 6 14H12C14.2091 14 16 15.7909 16 18V21H2V18Z", stroke: "currentColor", strokeWidth: "1.5" }],["path", { d: "M19 8C19 9.65685 17.6569 11 16 11M21 18C21 16.3431 19.6569 15 18 15H17", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }]];
      case 'edit': return [["path", { d: "M15.4998 5.50067L18.3282 8.3291M13 21H21M3 21.0004L3.04745 20.6683C3.21536 19.4929 3.29932 18.9052 3.49029 18.3565C3.65975 17.8697 3.89124 17.4067 4.17906 16.979C4.50341 16.4953 4.92319 16.0756 5.76274 15.236L17.4107 3.58795C18.1918 2.80688 19.4581 2.80688 20.2392 3.58795C21.0203 4.36902 21.0203 5.63535 20.2392 6.41642L8.37744 18.2782C7.61579 19.0398 7.23497 19.4206 6.8012 19.7063C6.41618 19.9581 6.00093 20.1627 5.56501 20.3152C5.07407 20.4881 4.54916 20.5656 3.49935 20.7205L3 21.0004Z", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }]];
      case 'share': return [["path", { d: "M9 11.5C9 12.8807 7.88071 14 6.5 14C5.11929 14 4 12.8807 4 11.5C4 10.1193 5.11929 9 6.5 9C7.88071 9 9 10.1193 9 11.5Z", stroke: "currentColor", strokeWidth: "1.5" }],["path", { d: "M14 6.5C14 7.88071 15.1193 9 16.5 9C17.8807 9 19 7.88071 19 6.5C19 5.11929 17.8807 4 16.5 4C15.1193 4 14 5.11929 14 6.5Z", stroke: "currentColor", strokeWidth: "1.5" }],["path", { d: "M14 17.5C14 18.8807 15.1193 20 16.5 20C17.8807 20 19 18.8807 19 17.5C19 16.1193 17.8807 15 16.5 15C15.1193 15 14 16.1193 14 17.5Z", stroke: "currentColor", strokeWidth: "1.5" }],["path", { d: "M8.5 13L14.5 16M14.5 8L8.5 11", stroke: "currentColor", strokeWidth: "1.5" }]];
      case 'delete': return [["path", { d: "M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6M3 6H21M9 6V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V6M10 11V17M14 11V17", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }]];
      case 'information': return [["circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "1.5" }],["path", { d: "M12 16V12", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }],["circle", { cx: "12", cy: "8", r: "1", fill: "currentColor" }]];
      default: return [];
    }
  }
}
