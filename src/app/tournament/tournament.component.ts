import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { EnvService } from '@app/env/env.service';
import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.scss']
})
export class TournamentComponent implements OnInit {
  private apiUrl: string;

  constructor(private httpClient: HttpClient, private env: EnvService) {
    this.apiUrl = this.env.customEnv.apiUrl;
  }

  ngOnInit() {}

  listTournament() {
    console.log('>>> tournament: ');
    this.httpClient
      .cache()
      .get(`${this.apiUrl}/api/tournament/348f6ae0-109f-4a3c-886d-2c2618e74246/leaderboard`)
      .subscribe(payload => console.log(payload));
  }
}
