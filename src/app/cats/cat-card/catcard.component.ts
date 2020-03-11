import { Component, OnInit } from '@angular/core';
import { CatsService } from '../cats.service';

@Component({
  selector: 'app-catcard',
  templateUrl: './catcard.component.html',
  styleUrls: ['./catcard.component.scss']
})
export class CatcardComponent implements OnInit {
  public cat: any;
  public currentVoteCount = 0;
  constructor(private catsService: CatsService) {}

  ngOnInit() {
    this.catsService.getRandomCat().subscribe(response => {
      this.cat = response[0].url;
      //
      // this.currentVoteCount = response[0]
    });
    // get the current vote count
    if (this.currentVoteCount) {
    }
  }

  getNewCat(upvote: boolean) {
    upvote ? this.currentVoteCount++ : (this.currentVoteCount = this.currentVoteCount);
    this.catsService.getRandomCat().subscribe(response => {
      this.cat = response[0].url;
    });
  }
}
