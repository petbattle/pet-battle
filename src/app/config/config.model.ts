export interface Configuration {
  tournamentsUrl: string;
  catsUrl: string;
  matomoUrl: string;
  keycloak: KeycloakOpts;
  cat404: string;
}

export interface KeycloakOpts {
  url: string;
  realm: string;
  clientId: string;
  redirectUri: string;
  enableLogging?: boolean;
}
