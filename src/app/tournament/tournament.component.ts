import { Component, OnInit } from '@angular/core';

import { TournamentsService } from './tournament.service';
import { Logger } from '@app/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { LeaderBoard } from './tournament.mode';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfigurationLoader } from '@app/config/configuration-loader.service';

const log = new Logger('TournamentComponent');

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.scss']
})
export class TournamentComponent implements OnInit {
  public identity: any;
  public leaderBoard: LeaderBoard[];
  public cat404: string;
  public cats: any[];
  private decodedToken: any;
  private tournamentId: string;

  constructor(
    private tournamentSvc: TournamentsService,
    private oAuthSvc: OAuthService,
    private modalService: NgbModal,
    private configLoader: ConfigurationLoader
  ) {
    this.cat404 = this.configLoader.getConfiguration().cat404;
    this.leaderBoard = [];
    // preload some data
    this.tournamentSvc.getTournament().subscribe(resp => {
      this.tournamentId = resp.TournamentID;
    });
    this.tournamentSvc.getAllCats().subscribe(all_cats => {
      // dirty hack - should not repeat svc here but was too lazy to impotr the module
      this.cats = all_cats;
      this.refreshLeaderBoard();
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

  voteForPet(petId: string, direction: string) {
    this.tournamentSvc.voteForPet(this.tournamentId, petId, direction).subscribe(resp => {
      log.info('VOTE', resp);
      this.refreshLeaderBoard();
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
      const lb: LeaderBoard[] = [];
      resp.map(tournament => {
        const foundCat = this.cats.findIndex(cat => cat.id === tournament.petId);
        tournament.image = foundCat === -1 ? this.cat404 : this.cats[foundCat].image;
        lb.push(tournament);
        // todo - sort out mapping the petId to the cats table id and pull the image
      });
      this.leaderBoard = lb;
    });
  }
  hasAdminRole(): boolean {
    return this.decodedToken.realm_access.roles.indexOf('pbadmin') > -1;
  }
  // Cat selecting modal ztuff
  openScrollableContent(longContent: any) {
    this.modalService.open(longContent, { scrollable: true });
  }

  selectCatForCompetition(cat: any, index: number): void {
    this.cats[index].selected = !this.cats[index].selected;
  }

  submitCatsToCompetition(): void {
    this.modalService.dismissAll('closing modals');
    this.cats.forEach((item, index) => {
      if (item.selected) {
        log.info('Adding Cat to competition', item.id);
        this.cats[index].selected = false;
        this.tournamentSvc.addNewPet(this.tournamentId, item.id).subscribe(payload => {
          log.info('Submitted new pet', payload);
        });
      }
    });
    this.refreshLeaderBoard();
  }
}
