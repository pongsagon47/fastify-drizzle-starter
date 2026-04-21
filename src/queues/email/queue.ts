import { Queue } from "bullmq";
import type { QueueConnectionOptions } from "@/queues/connection";
import { createQueueConnection } from "@/queues/connection";

// --- Job types ---

export type WelcomeJobData = {
  type: "welcome";
  to: string;
  name: string;
  loginUrl: string;
};

export type ResetPasswordJobData = {
  type: "reset-password";
  to: string;
  name: string;
  resetLink: string;
  expiresIn: string;
};

export type OtpJobData = {
  type: "otp";
  to: string;
  name: string;
  otp: string;
  expiresIn: string;
};

export type EmailJobData = WelcomeJobData | ResetPasswordJobData | OtpJobData;

// --- Queue instance ---

const connection: QueueConnectionOptions | null = createQueueConnection();

export const emailQueue = connection
  ? new Queue<EmailJobData, void, string>("email", {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    },
  })
  : null;

// --- Producer helper ---

export async function addEmailJob(data: EmailJobData): Promise<boolean> {
  if (!emailQueue) return false;
  await emailQueue.add(data.type, data);
  return true;
}
