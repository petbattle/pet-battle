import { Component, OnInit } from '@angular/core';

import { environment } from '@env/environment';
import { CatsService } from './cats.service';

@Component({
  selector: 'app-cats',
  templateUrl: './cats.component.html',
  styleUrls: ['./cats.component.scss']
})
export class CatsComponent implements OnInit {
  public first: string;
  public firstCount: string;
  public second: string;
  public secondCount: string;
  public third: string;
  public thirdCount: string;
  public listOfCatCards = [1, 2, 3, 4];
  public refreshing = true;
  public gotCats = false;

  constructor(private catsService: CatsService) {}

  ngOnInit() {
    this.refresh();
    this.catsService.getAllCatIds().subscribe(response => {
      response.length > 0 ? (this.gotCats = true) : (this.gotCats = false);
    });
  }

  public refresh() {
    this.refreshing = false;
    this.catsService.getTopCat().subscribe(response => {
      this.first = response[0].image;
      this.firstCount = response[0].count;
      this.second = response[1].image;
      this.secondCount = response[1].count;
      this.third = response[2].image;
      this.thirdCount = response[2].count;
      this.refreshing = true;
    });
  }
}
