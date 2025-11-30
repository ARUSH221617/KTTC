// Utility functions to interact with the API
import { Course, Contact, Certificate, Testimonial } from "@/types";

/**
 * Fetches the list of all courses from the API.
 *
 * @returns {Promise<Course[]>} A promise that resolves to an array of Course objects.
 * @throws {Error} If the API request fails.
 */
export async function getCourses(): Promise<Course[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/courses`);
  if (!res.ok) {
    throw new Error('Failed to fetch courses');
  }
  return res.json();
}

/**
 * Fetches the list of all contacts (messages) from the API.
 *
 * @returns {Promise<Contact[]>} A promise that resolves to an array of Contact objects.
 * @throws {Error} If the API request fails.
 */
export async function getContacts(): Promise<Contact[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/contact`);
  if (!res.ok) {
    throw new Error('Failed to fetch contacts');
  }
  return res.json();
}

/**
 * Fetches the list of all certificates from the API.
 *
 * @returns {Promise<Certificate[]>} A promise that resolves to an array of Certificate objects.
 * @throws {Error} If the API request fails.
 */
export async function getCertificates(): Promise<Certificate[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/certificates`);
  if (!res.ok) {
    throw new Error('Failed to fetch certificates');
  }
  return res.json();
}

/**
 * Fetches the list of all testimonials from the API.
 *
 * @returns {Promise<Testimonial[]>} A promise that resolves to an array of Testimonial objects.
 * @throws {Error} If the API request fails.
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/testimonials`);
  if (!res.ok) {
    throw new Error('Failed to fetch testimonials');
  }
  return res.json();
}
