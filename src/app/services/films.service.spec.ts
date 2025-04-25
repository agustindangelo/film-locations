import { TestBed } from '@angular/core/testing';
import { FilmsService } from './films.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

describe('FilmsService', () => {
  let service: FilmsService;
  let httpMock: HttpTestingController;
  const apiBaseUrl = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FilmsService]
    });
    service = TestBed.inject(FilmsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('search', () => {
    it('should return empty array when title is empty', (done) => {
      service.search('').subscribe((films) => {
        expect(films).toEqual([]);
        done();
      });
    });

    it('should call search API with trimmed title', () => {
      const title = ' Inception ';
      service.search(title).subscribe();
      const req = httpMock.expectOne(`${apiBaseUrl}/films/search?title=Inception`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('fetchLocationDetails', () => {
    it('should call film detail API with correct ID', () => {
      const id = '123';
      service.fetchLocationDetails(id).subscribe();
      const req = httpMock.expectOne(`${apiBaseUrl}/films/123`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });
});
