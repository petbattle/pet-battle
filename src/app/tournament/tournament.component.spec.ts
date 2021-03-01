import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Angulartics2Module } from 'angulartics2';
import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { AuthConfigModule } from '@app/auth/auth.config.module';
import { Cat404 } from './cat404.component';
import { TournamentComponent } from './tournament.component';

describe('TournamentComponent', () => {
  let component: TournamentComponent;
  let fixture: ComponentFixture<TournamentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        Angulartics2Module.forRoot(),
        CoreModule,
        SharedModule,
        HttpClientTestingModule,
        AuthConfigModule
      ],
      declarations: [TournamentComponent],
      providers: [Cat404]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
