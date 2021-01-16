import { Component, OnInit } from '@angular/core';

import { TournamentsService } from './tournament.service';
import { Logger } from '@app/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { LeaderBoard } from './tournament.mode';
const log = new Logger('TournamentComponent');

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.scss']
})
export class TournamentComponent implements OnInit {
  public identity: any;
  public leaderBoard: LeaderBoard[];
  private decodedToken: any;
  private tournamentId: string;

  constructor(private tournamentSvc: TournamentsService, private oAuthSvc: OAuthService) {
    this.leaderBoard = [];
    this.refreshLeaderBoard();
    this.tournamentSvc.getTournament().subscribe(resp => {
      this.tournamentId = resp.TournamentID;
    });
    this.identity = this.oAuthSvc.getIdentityClaims();
    const base64Url = this.oAuthSvc.getAccessToken().split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    this.decodedToken = JSON.parse(jsonPayload);
  }

  ngOnInit() {}

  createTournmament() {
    this.tournamentSvc.createNewTournament({}).subscribe(resp => {
      log.info('CREATE', resp);
      this.tournamentId = resp.TournamentID;
    });
  }

  voteForPet(petId: string) {
    this.tournamentSvc.voteForPet(this.tournamentId, petId).subscribe(resp => {
      log.info('VOTE', resp);
    });
  }

  stopTournmament() {
    this.tournamentSvc.createNewTournament({}).subscribe(resp => {
      log.info(resp);
    });
  }

  deleteTournmament() {
    this.tournamentSvc.deleteTournament(this.tournamentId).subscribe(resp => {
      log.info('DELETE', resp);
    });
  }

  refreshLeaderBoard() {
    this.tournamentSvc.getLeaderBoard().subscribe(resp => {
      log.info('GET LEADER BOARD', resp);
      this.leaderBoard = resp;
    });
  }
  hasAdminRole(): boolean {
    return this.decodedToken.realm_access.roles.indexOf('pbadmin') > -1;
  }
}
