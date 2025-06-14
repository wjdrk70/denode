import { Test, TestingModule } from '@nestjs/testing';
import { CoreEnumService } from './core-enum.service';

describe('CoreEnumService', () => {
  let service: CoreEnumService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoreEnumService],
    }).compile();

    service = module.get<CoreEnumService>(CoreEnumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
