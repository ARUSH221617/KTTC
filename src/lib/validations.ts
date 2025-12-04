import { z } from 'zod';

// User Schema
export const userSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6).optional(), // Changed to optional to allow invite flow/admin creation without password
  role: z.string().default('user'),
});

export const userUpdateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Course Schema
export const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().default('Unknown'), // Added default
  level: z.string().default('test'), // Added default
  duration: z.string().min(1),
  thumbnail: z.string().optional().or(z.literal("")), // Relaxed url() validation
  price: z.coerce.number().min(0).default(0),
  instructorId: z.string().min(1),
});

export const courseUpdateSchema = courseSchema.partial().extend({
  id: z.string(),
});

// Certificate Schema
export const certificateSchema = z.object({
  userId: z.string().min(1),
  courseId: z.string().min(1),
  status: z.string().default('valid'),
});

export const certificateUpdateSchema = z.object({
  id: z.string(),
  status: z.string().optional(),
});

// Testimonial Schema
export const testimonialSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  content: z.string().min(1),
  avatar: z.string().optional().or(z.literal("")), // Relaxed url() validation
});

export const testimonialUpdateSchema = testimonialSchema.partial().extend({
  id: z.string(),
});

// Contact Schema
export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  subject: z.string().optional(),
});
