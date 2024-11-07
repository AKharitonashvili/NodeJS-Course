import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './features/auth/auth.module';
import { User } from './features/users/entities/user.entity';
import { UsersModule } from './features/users/users.module';
import { Vinyl } from './features/vinyl/entities/vinyl.entity';
import { VinylModule } from './features/vinyl/vinyl.module';
import { ReviewsModule } from './features/reviews/reviews.module';
import { Review } from './features/reviews/entities/review.entity';
import { PaymentModule } from './features/payment/payment.module';
import { EmailModule } from './features/email/email.module';
import { CommonModule } from './common/common.module';
import { RequestLoggerMiddleware } from './common/middlewares/request-logger.middleware';
import { PurchasedVinyl } from './features/vinyl/entities/purchased-vinyl.entity';
import { Log } from './features/logging/entities/log.entity';
import { LoggingModule } from './features/logging/logging.module';
import { LogSubscriber } from './features/logging/subscriber/log.subscriber';

const modules = [
  CommonModule,
  AuthModule,
  UsersModule,
  VinylModule,
  ReviewsModule,
  PaymentModule,
  EmailModule,
  LoggingModule,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, Vinyl, Review, PurchasedVinyl, Log],
      subscribers: [LogSubscriber],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Log]),
    ...modules,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
