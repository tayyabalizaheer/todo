import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  footerLinks = {
    product: [
      { label: 'Features', route: '/features' },
      { label: 'Pricing', route: '/pricing' },
      { label: 'FAQ', route: '/faq' }
    ],
    company: [
      { label: 'About', route: '/about' },
      { label: 'Blog', route: '/blog' },
      { label: 'Contact', route: '/contact' }
    ],
    legal: [
      { label: 'Privacy', route: '/privacy' },
      { label: 'Terms', route: '/terms' },
      { label: 'Security', route: '/security' }
    ]
  };

  socialLinks = [
    { icon: '𝕏', label: 'Twitter', url: 'https://twitter.com' },
    { icon: '💼', label: 'LinkedIn', url: 'https://linkedin.com' },
    { icon: '🐙', label: 'GitHub', url: 'https://github.com' }
  ];
}
