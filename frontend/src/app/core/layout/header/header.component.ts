import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { TokenStorageService } from '../../services/token-storage.service';
import { AuthFacade } from '../../../features/auth/services/auth.facade';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  appName = environment.appName;
  isMenuOpen = false;

  constructor(
    private tokenStorage: TokenStorageService,
    private authFacade: AuthFacade,
    private router: Router
  ) {}

  get isLoggedIn(): boolean {
    return this.tokenStorage.hasToken();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.authFacade.logout();
    this.router.navigate(['/']);
    this.closeMenu();
  }
}
