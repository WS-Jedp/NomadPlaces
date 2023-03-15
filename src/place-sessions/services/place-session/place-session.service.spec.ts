import { Test, TestingModule } from '@nestjs/testing';
import { PlaceSessionService } from './place-session.service';

describe('PlaceSessionService', () => {
  let service: PlaceSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaceSessionService],
    }).compile();

    service = module.get<PlaceSessionService>(PlaceSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
