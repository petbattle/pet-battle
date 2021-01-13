import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { ConfigurationLoader } from '@app/config/configuration-loader.service';

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.scss']
})
export class TournamentComponent implements OnInit {
  private tournamentUrl: string;

  constructor(private httpClient: HttpClient, private configSvc: ConfigurationLoader) {
    this.tournamentUrl = this.configSvc.getConfiguration().tournamentsUrl;
  }

  ngOnInit() {}

  listTournament() {
    console.log('>>> tournament: ');
    this.httpClient
      .cache()
      .get(`${this.tournamentUrl}/api/tournament/348f6ae0-109f-4a3c-886d-2c2618e74246/leaderboard`)
      .subscribe(payload => console.log(payload));
  }
}
