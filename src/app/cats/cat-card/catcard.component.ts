import { Component, OnInit, Input } from '@angular/core';
import { CatsService } from '../cats.service';

@Component({
  selector: 'app-catcard',
  templateUrl: './catcard.component.html',
  styleUrls: ['./catcard.component.scss']
})
export class CatcardComponent implements OnInit {
  public cat: string;
  public currentVoteCount = 0;
  public spinner = true;
  constructor(private catsService: CatsService) {}

  ngOnInit() {
    this.catsService.getAllCats().subscribe(response => {
      const randoInt = Math.floor(Math.random() * (response.length + 1));
      this.cat = response[randoInt].image;
      this.spinner = false;
      this.currentVoteCount = response[randoInt].count;
    });
  }

  getNewCat(upvote: boolean) {
    upvote ? this.currentVoteCount++ : (this.currentVoteCount = this.currentVoteCount);
    this.catsService.getNewCat().subscribe(response => {
      this.cat = response.image;
      this.currentVoteCount = response.count;
    });
  }
}
