import { Test, TestingModule } from '@nestjs/testing';
import { PlaceSessionGateway } from './place-session.gateway';

describe('PlaceSessionGateway', () => {
  let gateway: PlaceSessionGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaceSessionGateway],
    }).compile();

    gateway = module.get<PlaceSessionGateway>(PlaceSessionGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
