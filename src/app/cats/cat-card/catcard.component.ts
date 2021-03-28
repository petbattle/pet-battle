import { Component, OnInit, Input } from '@angular/core';
import { CatsService } from '../cats.service';
import { ConfigurationLoader } from '@app/config/configuration-loader.service';
import { MatomoTracker } from 'ngx-matomo-v9';

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
  private analytics = false;

  constructor(
    private catsService: CatsService,
    private configSvc: ConfigurationLoader,
    private matomoTracker: MatomoTracker
  ) {}

  ngOnInit() {
    this.analytics = this.configSvc.getConfiguration().matomoUrl ? true : false;
    this.catsService.getNewCat().subscribe(response => {
      this.image = response.image;
      this.currentVoteCount = response.count;
      this.catId = response.id;
      this.spinner = false;
    });
  }

  getNewCat(vote: boolean) {
    if (this.analytics) {
      // instrument the buttons
      const voting = vote ? 'UP_VOTE' : 'DOWN_VOTE';
      this.matomoTracker.trackEvent('A/B Tests', 'Voting', voting);
    }
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
