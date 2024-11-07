import { InsertEvent, UpdateEvent, RemoveEvent } from 'typeorm';
import { Log } from '../entities/log.entity';
import { LogSubscriber } from './log.subscriber';

describe('LogSubscriber', () => {
  let logSubscriber: LogSubscriber;
  const mockManager = {
    getRepository: jest.fn().mockReturnThis(),
    save: jest.fn(),
  };

  beforeEach(() => {
    logSubscriber = new LogSubscriber();
    jest.clearAllMocks();
  });

  it('should log a CREATE action on afterInsert', async () => {
    const entity = { id: 1, name: 'TestEntity' };
    const mockEvent = {
      metadata: { name: 'TestEntity' },
      entity,
      manager: mockManager,
    } as unknown as InsertEvent<any>;

    await logSubscriber.afterInsert(mockEvent);

    expect(mockManager.getRepository).toHaveBeenCalledWith(Log);
    expect(mockManager.save).toHaveBeenCalledWith({
      action: 'CREATE',
      entity: 'TestEntity',
      details: JSON.stringify(entity),
    });
  });

  it('should log an UPDATE action on afterUpdate', async () => {
    const entity = { id: 1, name: 'UpdatedEntity' };
    const mockEvent = {
      metadata: { name: 'TestEntity' },
      entity,
      manager: mockManager,
    } as unknown as UpdateEvent<any>;

    await logSubscriber.afterUpdate(mockEvent);

    expect(mockManager.getRepository).toHaveBeenCalledWith(Log);
    expect(mockManager.save).toHaveBeenCalledWith({
      action: 'UPDATE',
      entity: 'TestEntity',
      details: JSON.stringify(entity),
    });
  });

  it('should log a DELETE action on afterRemove', async () => {
    const databaseEntity = { id: 1, name: 'DeletedEntity' };
    const mockEvent = {
      metadata: { name: 'TestEntity' },
      databaseEntity,
      manager: mockManager,
    } as unknown as RemoveEvent<any>;

    await logSubscriber.afterRemove(mockEvent);

    expect(mockManager.getRepository).toHaveBeenCalledWith(Log);
    expect(mockManager.save).toHaveBeenCalledWith({
      action: 'DELETE',
      entity: 'TestEntity',
      details: JSON.stringify(databaseEntity),
    });
  });

  it('should not log any action for the Log entity itself', async () => {
    const entity = { id: 1, action: 'CREATE', entity: 'Log' };
    const logInsertEvent = {
      metadata: { name: 'Log' },
      entity,
      manager: mockManager,
    } as unknown as InsertEvent<any>;

    await logSubscriber.afterInsert(logInsertEvent);

    expect(mockManager.save).not.toHaveBeenCalled();
  });
});
