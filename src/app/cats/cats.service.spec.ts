import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Angulartics2Module } from 'angulartics2';
import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';

import { CatsService } from './cats.service';

describe('CatsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, Angulartics2Module.forRoot(), CoreModule, SharedModule, HttpClientTestingModule]
    }).compileComponents();
  });

  it('should be created', () => {
    const service: CatsService = TestBed.get(CatsService);
    expect(service).toBeTruthy();
  });
});
