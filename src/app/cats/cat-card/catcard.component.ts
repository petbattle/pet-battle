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
    this.catsService.getNewCat().subscribe(response => {
      this.image = response.image;
      this.currentVoteCount = response.count;
      this.catId = response.id;
      this.spinner = false;
    });
  }

  getNewCat(vote: boolean) {
    this.spinner = true;
    const body = { image: this.image, id: this.catId, count: this.currentVoteCount, vote };
    vote ? this.currentVoteCount++ : this.currentVoteCount--;
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
  }
}
