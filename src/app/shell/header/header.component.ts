import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  menuHidden = true;
  buttonText: string;
  isLoggedIn: boolean;

  constructor(private readonly keycloakSvc: KeycloakService, private router: Router) {
    this.keycloakSvc.isLoggedIn().then(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      this.buttonText = isLoggedIn ? 'Logout' : 'Login';
    });
  }

  ngOnInit() {}

  toggleMenu() {
    this.menuHidden = !this.menuHidden;
  }

  async logout() {
    if (this.isLoggedIn) {
      await this.keycloakSvc.logout(`${window.location.origin}/home`);
    } else {
      await this.keycloakSvc.login({
        redirectUri: `${window.location.origin}${this.router.url}`
      });
    }
  }
}
