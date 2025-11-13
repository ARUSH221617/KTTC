// Utility functions to interact with the API
import { Course, Contact, Certificate, Testimonial } from "@/types";

export async function getCourses(): Promise<Course[]> {
  const res = await fetch('/api/courses');
  if (!res.ok) {
    throw new Error('Failed to fetch courses');
  }
  return res.json();
}

export async function getContacts(): Promise<Contact[]> {
  const res = await fetch('/api/contact');
  if (!res.ok) {
    throw new Error('Failed to fetch contacts');
  }
  return res.json();
}

export async function getCertificates(): Promise<Certificate[]> {
  const res = await fetch('/api/certificates');
  if (!res.ok) {
    throw new Error('Failed to fetch certificates');
  }
  return res.json();
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const res = await fetch('/api/testimonials');
  if (!res.ok) {
    throw new Error('Failed to fetch testimonials');
  }
  return res.json();
}