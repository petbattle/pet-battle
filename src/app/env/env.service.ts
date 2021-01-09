import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  // The values that are defined here are the default values that can
  // be overridden by env.js

  // API url
  public customEnv = {
    catUrl: 'http://pet-battle-api-labs-staging.apps.hivec.sandbox1438.opentlc.com',
    apiUrl: 'http://pet-battle-tournament-labs-staging.apps.hivec.sandbox1438.opentlc.com'
  };

  // Whether or not to enable debug mode
  public enableDebug = true;

  constructor() {}
}
