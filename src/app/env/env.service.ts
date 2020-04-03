import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  // The values that are defined here are the default values that can
  // be overridden by env.js

  // API url
  public customEnv = { 
    catUrl: 'http://cats-pet-battle-api.apps.s43.core.rht-labs.com',
    apiUrl: 'http://localhost:8888' 
  };

  // Whether or not to enable debug mode
  public enableDebug = true;

  constructor() {}
}
