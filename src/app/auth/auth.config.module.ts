import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { OAuthModule } from 'angular-oauth2-oidc';

import { AuthConfigService } from './auth.config.service';
import { OAuthModuleConfig } from './auth.config';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { ConfigurationLoader } from '@app/config/configuration-loader.service';

@NgModule({
  imports: [HttpClientModule, OAuthModule.forRoot()],
  providers: [
    {
      provide: APP_INITIALIZER,
      deps: [ConfigurationLoader, AuthConfigService],
      useFactory: (configSvc: ConfigurationLoader, authConfigService: AuthConfigService) => {
        return () => {
          // to ensure the config for keycloak is avail prior to trying to connect to it....
          return configSvc.loadConfiguration().then(() => {
            return authConfigService.initAuth();
          });
        };
      },
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    AuthConfigService,
    // PbAuthConfig,
    OAuthModuleConfig
  ]
})
export class AuthConfigModule {}
