import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ConfigurationLoader } from '@app/config/configuration-loader.service';
import { LeaderBoard } from './tournament.mode';

@Injectable({
  providedIn: 'root'
})
export class TournamentsService {
  private tournamentsUrl: string;

  constructor(private httpClient: HttpClient, private configSvc: ConfigurationLoader) {
    this.tournamentsUrl = this.configSvc.getConfiguration().tournamentsUrl;
  }

  getLeaderBoard(): Observable<LeaderBoard[]> {
    return this.httpClient.get(`${this.tournamentsUrl}/api/tournament/leaderboard`).pipe(
      map((body: any) => {
        // this.cats = this.cats ? this.cats : this.shuffle(body);
        return body;
      }),
      // map(e => this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(e))),
      catchError(err => of({ id: '404', err }))
    );
  }

  getTournament(): Observable<any> {
    return this.httpClient
      .cache()
      .get(`${this.tournamentsUrl}/api/tournament`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(
        map((body: any) => {
          return body;
        }),
        catchError(() => of({ id: '404', image: '' }))
      );
  }

  // getTopCat(): Observable<any> {
  //   return this.httpClient.get(`${this.catUrl}/cats/topcats`).pipe(
  //     map((body: any) => {
  //       return body;
  //     }),
  //     // map(e => this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(e))),
  //     catchError(() => of({ id: '404', url: 'https://http.cat/404' }))
  //   );
  // }

  createNewTournament(tournament: any): Observable<any> {
    return (
      this.httpClient
        // .cache()
        .post(`${this.tournamentsUrl}/api/tournament`, tournament)
        .pipe(
          map((body: any) => {
            return body;
          })
        )
    );
  }

  deleteTournament(tournamentId: string): Observable<any> {
    return (
      this.httpClient
        // .cache()
        .delete(`${this.tournamentsUrl}/api/tournament/${tournamentId}`)
        .pipe(
          map((body: any) => {
            return body;
          })
        )
    );
  }

  voteForPet(tournamentId: string, petId: string, direcction: string): Observable<any> {
    return (
      this.httpClient
        // .cache()
        .post(`${this.tournamentsUrl}/api/tournament/${tournamentId}/vote/${petId}?dir=${direcction}`, {})
        .pipe(
          map((body: any) => {
            return body;
          })
        )
    );
  }
}
