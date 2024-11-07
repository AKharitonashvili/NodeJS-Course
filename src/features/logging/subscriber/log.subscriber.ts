import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import { Log } from '../entities/log.entity';

@EventSubscriber()
export class LogSubscriber implements EntitySubscriberInterface {
  async afterInsert<T>(event: InsertEvent<T>) {
    if (event.metadata.name === 'Log') return;

    const log = new Log();
    log.action = 'CREATE';
    log.entity = event.metadata.name;
    log.details = JSON.stringify(event.entity ?? '{}');

    await event.manager.getRepository(Log).save(log);
  }

  async afterUpdate<T>(event: UpdateEvent<T>) {
    if (event.metadata.name === 'Log') return;

    const log = new Log();
    log.action = 'UPDATE';
    log.entity = event.metadata.name;
    log.details = JSON.stringify(event.entity ?? '{}');

    await event.manager.getRepository(Log).save(log);
  }

  async afterRemove<T>(event: RemoveEvent<T>) {
    if (event.metadata.name === 'Log') return;

    const log = new Log();
    log.action = 'DELETE';
    log.entity = event.metadata.name;
    log.details = JSON.stringify(event.databaseEntity ?? '{}');

    await event.manager.getRepository(Log).save(log);
  }
}
