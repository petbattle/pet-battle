import { AuthConfig } from 'angular-oauth2-oidc';

export interface Configuration {
  tournamentsUrl: string;
  catsUrl: string;
  keycloak: AuthConfig;
}
