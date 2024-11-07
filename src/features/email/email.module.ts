import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EmailListener } from './listeners/email.listener';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [EmailService, EmailListener],
  exports: [EmailService],
})
export class EmailModule {}
