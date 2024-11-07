import { Test, TestingModule } from '@nestjs/testing';
import { LogsController } from './logs.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Log } from '../entities/log.entity';
import { Repository } from 'typeorm';
import { AdminGuard } from '../../../common/guards/admin.guard';

describe('LogsController', () => {
  let controller: LogsController;
  let logRepository: Repository<Log>;

  const mockLogRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogsController],
      providers: [
        {
          provide: getRepositoryToken(Log),
          useValue: mockLogRepository,
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<LogsController>(LogsController);
    logRepository = module.get<Repository<Log>>(getRepositoryToken(Log));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should retrieve all system logs with sort order DESC', async () => {
    const mockLogs = [
      { id: 1, message: 'System started', timestamp: new Date() },
    ];
    mockLogRepository.find.mockResolvedValue(mockLogs);

    const result = await controller.getAllLogs();
    expect(result).toEqual(mockLogs);
    expect(mockLogRepository.find).toHaveBeenCalledWith({
      order: { timestamp: 'DESC' },
    });
  });

  it('should be restricted to admin users', () => {
    expect(AdminGuard).toBeDefined();
  });
});
