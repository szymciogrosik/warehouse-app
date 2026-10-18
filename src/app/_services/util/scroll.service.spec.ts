import { TestBed } from '@angular/core/testing';
import { ScrollService } from './scroll.service';

describe('ScrollService', () => {
  let service: ScrollService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScrollService]
    });
    service = TestBed.inject(ScrollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit elementId on scrollRequest when requestScrollTo is called', (done) => {
    const targetElementId = 'terms-section';

    service.scrollRequest.subscribe((id) => {
      expect(id).toBe(targetElementId);
      done();
    });

    service.requestScrollTo(targetElementId);
  });
});
