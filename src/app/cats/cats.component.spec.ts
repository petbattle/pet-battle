import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatcardModule } from './cat-card/catcard.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Angulartics2Module } from 'angulartics2';
import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';

import { CatsComponent } from './cats.component';
import { CatsService } from './cats.service';

describe('CatsComponent', () => {
  let component: CatsComponent;
  let fixture: ComponentFixture<CatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        Angulartics2Module.forRoot(),
        CoreModule,
        SharedModule,
        HttpClientTestingModule,
        CatcardModule
      ],
      declarations: [CatsComponent],
      providers: [CatsService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
