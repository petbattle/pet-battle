import { Component, OnInit } from '@angular/core';

import { environment } from '@env/environment';
import { CatsService } from './cats.service';

@Component({
  selector: 'app-cats',
  templateUrl: './cats.component.html',
  styleUrls: ['./cats.component.scss']
})
export class CatsComponent implements OnInit {
  public cat: any;
  public listOfCatCards = [1, 2, 3, 4];
  private topCat: any;

  constructor(private catsService: CatsService) {}

  ngOnInit() {
    this.catsService.getTopCat().subscribe(response => {
      this.topCat = response[0].id;
      this.cat = response[0].url;
    });
  }
}
