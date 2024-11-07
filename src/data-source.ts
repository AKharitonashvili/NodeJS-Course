import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Log } from './features/logging/entities/log.entity';
import { LogSubscriber } from './features/logging/subscriber/log.subscriber';
import { Review } from './features/reviews/entities/review.entity';
import { User } from './features/users/entities/user.entity';
import { PurchasedVinyl } from './features/vinyl/entities/purchased-vinyl.entity';
import { Vinyl } from './features/vinyl/entities/vinyl.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User, Vinyl, Review, PurchasedVinyl, Log],
  subscribers: [LogSubscriber],
  synchronize: false,
  migrations: [__dirname + '/migrations/*.ts'],
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
