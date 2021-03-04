import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Configuration, KeycloakOpts } from './config.model';
import { Logger } from '@app/core';
const log = new Logger('ConfigurationLoader');
@Injectable({
  providedIn: 'root'
})
export class ConfigurationLoader {
  private readonly CONFIGURATION_URL = './assets/configuration/config.json';
  private _keycloak: KeycloakOpts = {
    url: '',
    realm: '',
    clientId: '',
    redirectUri: ''
  };
  private _configuration: Configuration = {
    tournamentsUrl: '',
    catsUrl: '',
    keycloak: this._keycloak,
    cat404: ''
  };

  constructor(private _http: HttpClient) {}

  public loadConfiguration() {
    return this._http
      .get(this.CONFIGURATION_URL)
      .toPromise()
      .then((configuration: Configuration) => {
        log.info('Config Loaded', configuration);
        this._configuration = configuration;
        return configuration;
      })
      .catch((error: any) => {
        log.error(error);
      });
  }

  getConfiguration() {
    return this._configuration;
  }
}
