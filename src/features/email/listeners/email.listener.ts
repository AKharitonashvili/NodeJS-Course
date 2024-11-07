import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../services/email.service';
import { EventEnum } from '../../../common/enums/event.enum';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class EmailListener {
  constructor(private readonly emailService: EmailService) {}

  @OnEvent(EventEnum.VINYL_PURCHASED)
  async handleVinylPurchasedEvent(payload: {
    user: User;
    vinylName: string;
    count: number;
    totalPrice: number;
  }) {
    const { user, vinylName, count, totalPrice } = payload;

    const subject = `Purchase Confirmation for ${vinylName}`;
    const text = `You purchased ${count} copy of "${vinylName}" for a total of $${totalPrice}.`;
    const html = `
  <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border: 1px solid #ccc; text-align: center; font-family: Arial, sans-serif;">
  <h1 style="color: #4CAF50; margin-bottom: 20px;">Purchase Confirmation</h1>
  <p style="font-size: 16px; margin-bottom: 10px;">
    You purchased <span style="color: #4CAF50;">1</span> copy of 
    <span style="color: #4CAF50;">"${vinylName}"</span> for a total of 
    <span style="color: #4CAF50;">$${totalPrice}</span>.
  </p>
  <p style="font-size: 14px; color: #333;">
    Dear <span style="color: #4CAF50;">${user.firstName}</span>, Thank you for your purchase!
  </p>
</div>
`;

    await this.emailService.sendEmail(user.email, subject, text, html);
  }
}
