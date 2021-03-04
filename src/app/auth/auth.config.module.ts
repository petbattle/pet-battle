import { NgModule, APP_INITIALIZER } from '@angular/core';
// import { HttpClientModule } from '@angular/common/http';
// import { OAuthModule } from 'angular-oauth2-oidc';

// import { AuthConfigService } from './auth.config.service';
// import { OAuthModuleConfig } from './auth.config';

// import { HTTP_INTERCEPTORS } from '@angular/common/http';
// import { AuthInterceptor } from './auth.interceptor';
import { ConfigurationLoader } from '@app/config/configuration-loader.service';
import { Configuration } from '@app/config/config.model';

import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

@NgModule({
  imports: [KeycloakAngularModule],
  providers: [
    {
      provide: APP_INITIALIZER,
      deps: [ConfigurationLoader, KeycloakService],
      useFactory: (configSvc: ConfigurationLoader, keycloak: KeycloakService) => {
        return () => {
          // to ensure the config for keycloak is avail prior to trying to connect to it....
          return configSvc.loadConfiguration().then((allConfig: Configuration) => {
            return () =>
              keycloak.init({
                config: {
                  url: allConfig.keycloak.url,
                  realm: allConfig.keycloak.realm,
                  clientId: allConfig.keycloak.clientId
                },
                initOptions: {
                  onLoad: 'check-sso',
                  redirectUri: allConfig.keycloak.redirectUri,
                  enableLogging: true || allConfig.keycloak.enableLogging,
                  silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
                }
              });
          });
        };
      },
      multi: true
    }
  ]
})
export class AuthConfigModule {}
