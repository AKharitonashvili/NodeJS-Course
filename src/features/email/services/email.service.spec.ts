import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;
  let sendMailMock: jest.Mock;

  beforeEach(async () => {
    sendMailMock = jest.fn();

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'EMAIL_HOST':
                  return 'smtp.example.com';
                case 'EMAIL_PORT':
                  return 587;
                case 'EMAIL_USER':
                  return 'user@example.com';
                case 'EMAIL_PASS':
                  return 'password';
                case 'EMAIL_FROM':
                  return 'noreply@example.com';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('should send an email', async () => {
    const emailData = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      text: 'Test email content',
      html: '<p>Test email content</p>',
    };

    await service.sendEmail(
      emailData.to,
      emailData.subject,
      emailData.text,
      emailData.html,
    );

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'noreply@example.com',
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
    });
  });

  it('should call configService.get with the correct keys', () => {
    service.sendEmail('recipient@example.com', 'Test Subject', 'Test text');

    expect(configService.get).toHaveBeenCalledWith('EMAIL_HOST');
    expect(configService.get).toHaveBeenCalledWith('EMAIL_PORT');
    expect(configService.get).toHaveBeenCalledWith('EMAIL_USER');
    expect(configService.get).toHaveBeenCalledWith('EMAIL_PASS');
    expect(configService.get).toHaveBeenCalledWith('EMAIL_FROM');
  });
});
