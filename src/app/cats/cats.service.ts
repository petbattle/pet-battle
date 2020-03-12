import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class CatsService {
  constructor(private httpClient: HttpClient, private domSanitizer: DomSanitizer) {}

  // [{"id":5,"name":"boxes"},
  //   { "id": 15, "name": "clothes" },
  // { "id": 1, "name": "hats" },
  // { "id": 14, "name": "sinks" },
  // { "id": 2, "name": "space" },
  // { "id": 4, "name": "sunglasses" },
  // { "id": 7, "name": "ties" }]
  // https://api.thecatapi.com/v1/images/search?category_ids=5
  // https://api.thecatapi.com/v1/images/search?mime_types=jpg,png
  //

  // Post new cat to db

  // Change

  //
  getRandomCat(): Observable<any> {
    return (
      this.httpClient
        // .cache()
        .get('https://api.thecatapi.com/v1/images/search?category_ids=7&mime_types=jpg,png')
        .pipe(
          map((body: any) => {
            return body;
          }),
          // map(e => this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(e))),
          catchError(() => of({ id: '404', url: 'https://http.cat/404' }))
        )
    );
  }

  //
  getTopCat(): Observable<any> {
    return (
      this.httpClient
        // .cache()
        .get('https://')
        .pipe(
          map((body: any) => {
            return body;
          }),
          // map(e => this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(e))),
          catchError(() => of({ id: '404', url: 'https://http.cat/404' }))
        )
    );
  }

  // bumpCatVote(cat: any): Observable<any> {
  //   return (
  //     this.httpClient
  //       // .cache()
  //       .put('https://')
  //       .pipe(
  //         map((body: any) => {
  //           return body;
  //         }),
  //         catchError(() => of({ id: '404', url: 'https://http.cat/404' }))
  //       )
  //   );
  // }

  createNewCat(cat: any): Observable<any> {
    return (
      this.httpClient
        // .cache()
        .post('/cats', cat)
        .pipe(
          map((body: any) => {
            return body;
          })
          // map(e => this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(e))),
          // catchError(() => of({ id: '404', url: 'https://http.cat/404' }))
        )
    );
  }
}
