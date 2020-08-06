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
  private catUrl: string;

  constructor(private httpClient: HttpClient, private env: EnvService) {
    this.catUrl = this.env.customEnv.catUrl;
  }

  ngOnInit() {}

  listTournament() {
    console.log('>>> tournament: ');
    this.httpClient
      .cache()
      .get(`${this.catUrl}/tournament/061bac83-dc57-473a-a2f7-f816ae330313/leaderboard`)
      .subscribe(payload => console.log(payload));
  }
}
