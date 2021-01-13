import { AuthConfig } from 'angular-oauth2-oidc';

export interface Configuration {
  tournaments: string;
  cats: string;
  keycloak: AuthConfig;
}
