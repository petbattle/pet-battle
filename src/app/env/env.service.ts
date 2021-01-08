import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  // The values that are defined here are the default values that can
  // be overridden by env.js

  // API url
  public customEnv = {
    catUrl: 'http://localhost:8082',
    apiUrl: 'http://localhost:8081'
  };

  // Whether or not to enable debug mode
  public enableDebug = true;

  constructor() {}
}
