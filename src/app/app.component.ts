import { Component, OnInit, OnDestroy } from '@angular/core';

import { environment } from '@env/environment';
import { Logger } from '@app/core';
import { ConfigurationLoader } from './config/configuration-loader.service';
import { Configuration } from './config/config.model';

const log = new Logger('App');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  _config: Configuration;

  constructor(configurationLoaderSvc: ConfigurationLoader) {
    this._config = configurationLoaderSvc.getConfiguration();
  }
  ngOnInit() {
    // Setup logger
    if (environment.production) {
      Logger.enableProductionMode();
    }

    log.debug('init');
    log.debug('CONFIG_LOADED', this._config);
  }

  ngOnDestroy() {}
}
