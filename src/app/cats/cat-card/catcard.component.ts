import { Component, OnInit, Input } from '@angular/core';
import { CatsService } from '../cats.service';

@Component({
  selector: 'app-catcard',
  templateUrl: './catcard.component.html',
  styleUrls: ['./catcard.component.scss']
})
export class CatcardComponent implements OnInit {
  public image: string;
  public currentVoteCount = 0;
  public spinner = true;
  public compOver = false;
  private catId: string;

  constructor(private catsService: CatsService) {}

  ngOnInit() {
    this.catsService.getAllCats().subscribe(response => {
      const randoInt = Math.floor(Math.random() * response.length);
      this.image = response[randoInt].image;
      this.spinner = false;
      this.currentVoteCount = response[randoInt].count;
      this.catId = response[randoInt].id;
    });
  }

  getNewCat(vote: boolean) {
    const body = { image: this.image, id: this.catId, count: this.currentVoteCount, vote };
    vote ? this.currentVoteCount++ : (this.currentVoteCount = this.currentVoteCount);
    this.catsService.createNewCat(body).subscribe(response => {
      console.log(response);
    });
    this.catsService.getNewCat().subscribe(response => {
      this.image =
        (response && response.image) ||
        'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTT1GKgFHP_ILthMtROZlsHlELrNayJKsIwNm-br0IVWqZZvvBd';
      this.currentVoteCount = (response && response.count) || '0';
      this.catId = (response && response.id) || null;
      this.compOver = response === undefined ? true : false;
      this.spinner = false;
    });
    this.catsService.getTopCat();
  }
}
