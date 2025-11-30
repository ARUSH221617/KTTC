// Define the types for our data models

/**
 * Represents a Course in the platform.
 */
export interface Course {
  /** Unique identifier for the course. */
  id: string;
  /** Title of the course. */
  title: string;
  /** Description of the course content. */
  description: string;
  /** Category of the course (e.g., Development, Design). */
  category: string;
  /** Difficulty level (e.g., Beginner, Intermediate). */
  level: string;
  /** Duration of the course. */
  duration: string;
  /** Name of the instructor. */
  instructor: string;
  /** URL to the course thumbnail image. */
  thumbnail?: string;
  /** ISO timestamp of creation. */
  createdAt: string;
  /** ISO timestamp of last update. */
  updatedAt: string;
}

/**
 * Represents a User in the system.
 */
export interface User {
  /** Unique identifier for the user. */
  id: string;
  /** Email address of the user. */
  email: string;
  /** Full name of the user. */
  name?: string;
  /** ISO timestamp of creation. */
  createdAt: string;
  /** ISO timestamp of last update. */
  updatedAt: string;
}

/**
 * Represents a Contact message from a user.
 */
export interface Contact {
  /** Unique identifier for the message. */
  id: string;
  /** Name of the sender. */
  name: string;
  /** Email of the sender. */
  email: string;
  /** Subject of the message. */
  subject: string;
  /** Content of the message. */
  message: string;
  /** ISO timestamp of creation. */
  createdAt: string;
  /** ISO timestamp of last update. */
  updatedAt: string;
}

/**
 * Represents a completion Certificate.
 */
export interface Certificate {
  /** Unique identifier for the certificate. */
  id: string;
  /** Unique certificate number. */
  certificateNo: string;
  /** Name of the certificate holder. */
  holderName: string;
  /** ID of the related course. */
  courseId: string;
  /** Optional nested course details. */
  course?: {
    title: string;
    instructor: string;
  };
  /** Date the certificate was issued. */
  issueDate: string;
  /** Whether the certificate is valid. */
  isValid: boolean;
  /** ISO timestamp of creation. */
  createdAt: string;
  /** ISO timestamp of last update. */
  updatedAt: string;
}

/**
 * Represents a Testimonial from a user.
 */
export interface Testimonial {
  /** Unique identifier for the testimonial. */
  id: string;
  /** Name of the person giving the testimonial. */
  name: string;
  /** Role or title of the person. */
  role: string;
  /** The content/body of the testimonial. */
  content: string;
  /** URL to the person's avatar image. */
  avatar?: string;
  /** ISO timestamp of creation. */
  createdAt: string;
  /** ISO timestamp of last update. */
  updatedAt: string;
}
