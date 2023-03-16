import { Test, TestingModule } from '@nestjs/testing';
import { PlaceSessionController } from './place-session.controller';

describe('PlaceSessionController', () => {
  let controller: PlaceSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaceSessionController],
    }).compile();

    controller = module.get<PlaceSessionController>(PlaceSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
