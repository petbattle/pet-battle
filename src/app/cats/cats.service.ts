import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class CatsService {
  private cats: any;

  constructor(private httpClient: HttpClient, private domSanitizer: DomSanitizer) {}

  // https://api.thecatapi.com/v1/images/search?category_ids=7&mime_types=jpg
  // [{"id":5,"name":"boxes"},
  //   { "id": 15, "name": "clothes" },
  // { "id": 1, "name": "hats" },
  // { "id": 14, "name": "sinks" },
  // { "id": 2, "name": "space" },
  // { "id": 4, "name": "sunglasses" },
  // { "id": 7, "name": "ties" }]
  // https://api.thecatapi.com/v1/images/search?category_ids=5
  // https://api.thecatapi.com/v1/images/search?mime_types=jpg,png

  setNewCat(cat: any) {
    this.cats.push(cat);
    // return this.cats;
  }

  getNewCat(): Observable<any> {
    return of(this.cats.pop());
  }

  getAllCats(): Observable<any> {
    return this.httpClient
      .cache()
      .get('http://cats-cats.apps.hivec.sandbox526.opentlc.com/cats/')
      .pipe(
        map((body: any) => {
          this.cats = this.shuffle(body);
          return body;
        }),
        // map(e => this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(e))),
        catchError(() => of({ id: '404', image: '' }))
      );
  }

  getTopCat(): Observable<any> {
    return this.httpClient.get('http://cats-cats.apps.hivec.sandbox526.opentlc.com/cats/topcats').pipe(
      map((body: any) => {
        return body;
      }),
      // map(e => this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(e))),
      catchError(() => of({ id: '404', url: 'https://http.cat/404' }))
    );
  }

  createNewCat(cat: any): Observable<any> {
    return (
      this.httpClient
        // .cache()
        .post('http://cats-cats.apps.hivec.sandbox526.opentlc.com/cats', cat)
        .pipe(
          map((body: any) => {
            return body;
          })
          // map(e => this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(e))),
          // catchError(() => of({ id: '404', url: 'https://http.cat/404' }))
        )
    );
  }

  private shuffle(a: any): any {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
