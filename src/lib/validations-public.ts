import { z } from 'zod';

export const publicCertificateSchema = z.object({
  certificateNo: z.string().min(1),
  userId: z.string().min(1),
  courseId: z.string().min(1),
  status: z.string().default('valid'),
});

export const publicCertificateUpdateSchema = z.object({
  certificateNo: z.string().min(1),
  status: z.string().min(1),
});
