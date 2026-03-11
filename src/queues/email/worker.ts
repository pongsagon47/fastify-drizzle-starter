import { Worker } from 'bullmq';
import type { Transporter } from 'nodemailer';
import type { QueueConnectionOptions } from '../connection';
import type { EmailJobData } from './queue';
import { sendWelcomeMail, sendResetPasswordMail, sendOtpMail } from '@/utils/mailer/mailer';

export function createEmailWorker(connection: QueueConnectionOptions, mailer: Transporter) {
  return new Worker<EmailJobData, void, string>(
    'email',
    async (job) => {
      const { data } = job;
      switch (data.type) {
        case 'welcome':
          await sendWelcomeMail(mailer, data.to, {
            name: data.name,
            loginUrl: data.loginUrl,
          });
          break;

        case 'reset-password':
          await sendResetPasswordMail(mailer, data.to, {
            name: data.name,
            resetLink: data.resetLink,
            expiresIn: data.expiresIn,
          });
          break;

        case 'otp':
          await sendOtpMail(mailer, data.to, {
            name: data.name,
            otp: data.otp,
            expiresIn: data.expiresIn,
          });
          break;
      }
    },
    {
      connection,
      concurrency: 5,
    }
  );
}
