import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { ConfigurationLoader } from '@app/config/configuration-loader.service';
import { TournamentsService } from './tournament.service';
import { Logger } from '@app/core';
const log = new Logger('TournamentComp');

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.scss']
})
export class TournamentComponent implements OnInit {
  private tournamentUrl: string;

  constructor(
    private httpClient: HttpClient,
    private configSvc: ConfigurationLoader,
    private tournamentSvc: TournamentsService
  ) {
    this.tournamentUrl = this.configSvc.getConfiguration().tournamentsUrl;
  }

  ngOnInit() {}

  createTournmament() {
    this.tournamentSvc.createNewTournament({}).subscribe(resp => {
      log.info(resp);
    });
  }

  listTournament() {
    console.log('>>> tournament: ');
    this.httpClient
      .cache()
      .get(`${this.tournamentUrl}/api/tournament/leaderboard`)
      .subscribe(payload => console.log(payload));
  }
}
