import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../services/email.service';
import { EventEnum } from '../../../common/enums/event.enum';
import { User } from '../../users/entities/user.entity';
import { EmailListener } from './email.listener';

describe('EmailListener', () => {
  let emailListener: EmailListener;
  let emailService: EmailService;

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailListener,
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    emailListener = module.get<EmailListener>(EmailListener);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should send an email when the vinyl purchased event is triggered', async () => {
    const user: User = {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    } as User;

    const payload = {
      user,
      vinylName: 'Test Vinyl',
      count: 1,
      totalPrice: 25.5,
    };

    const expectedSubject = `Purchase Confirmation for ${payload.vinylName}`;
    const expectedText = `You purchased ${payload.count} copy of "${payload.vinylName}" for a total of $${payload.totalPrice}.`;
    const expectedHtml = `
  <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border: 1px solid #ccc; text-align: center; font-family: Arial, sans-serif;">
  <h1 style="color: #4CAF50; margin-bottom: 20px;">Purchase Confirmation</h1>
  <p style="font-size: 16px; margin-bottom: 10px;">
    You purchased <span style="color: #4CAF50;">1</span> copy of 
    <span style="color: #4CAF50;">"${payload.vinylName}"</span> for a total of 
    <span style="color: #4CAF50;">$${payload.totalPrice}</span>.
  </p>
  <p style="font-size: 14px; color: #333;">
    Dear <span style="color: #4CAF50;">${user.firstName}</span>, Thank you for your purchase!
  </p>
</div>
`;

    await emailListener.handleVinylPurchasedEvent(payload);

    expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
      user.email,
      expectedSubject,
      expectedText,
      expectedHtml,
    );
  });
});
