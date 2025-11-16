// Define the types for our data models
/**
 * @interface Course
 * @property {string} id - The unique identifier for the course.
 * @property {string} title - The title of the course.
 * @property {string} description - A brief description of the course.
 * @property {string} category - The category the course belongs to.
 * @property {string} level - The difficulty level of the course.
 * @property {string} duration - The duration of the course.
 * @property {string} instructor - The name of the course instructor.
 * @property {string} [thumbnail] - The URL of the course thumbnail.
 * @property {string} createdAt - The timestamp when the course was created.
 * @property {string} updatedAt - The timestamp when the course was last updated.
 */
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  instructor: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * @interface User
 * @property {string} id - The unique identifier for the user.
 * @property {string} email - The user's email address.
 * @property {string} [name] - The user's name.
 * @property {string} createdAt - The timestamp when the user was created.
 * @property {string} updatedAt - The timestamp when the user was last updated.
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * @interface Contact
 * @property {string} id - The unique identifier for the contact message.
 * @property {string} name - The name of the person who sent the message.
 * @property {string} email - The email address of the person who sent the message.
 * @property {string} subject - The subject of the message.
 * @property {string} message - The content of the message.
 * @property {string} createdAt - The timestamp when the message was created.
 * @property {string} updatedAt - The timestamp when the message was last updated.
 */
export interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * @interface Certificate
 * @property {string} id - The unique identifier for the certificate.
 * @property {string} certificateNo - The certificate number.
 * @property {string} holderName - The name of the person who holds the certificate.
 * @property {string} courseId - The ID of the course the certificate is for.
 * @property {{ title: string; instructor: string }} [course] - The course the certificate is for.
 * @property {string} issueDate - The date the certificate was issued.
 * @property {boolean} isValid - Whether the certificate is valid.
 * @property {string} createdAt - The timestamp when the certificate was created.
 * @property {string} updatedAt - The timestamp when the certificate was last updated.
 */
export interface Certificate {
  id: string;
  certificateNo: string;
  holderName: string;
  courseId: string;
  course?: {
    title: string;
    instructor: string;
  };
  issueDate: string;
  isValid: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * @interface Testimonial
 * @property {string} id - The unique identifier for the testimonial.
 * @property {string} name - The name of the person who gave the testimonial.
 * @property {string} role - The role of the person who gave the testimonial.
 * @property {string} content - The content of the testimonial.
 * @property {string} [avatar] - The URL of the avatar of the person who gave the testimonial.
 * @property {string} createdAt - The timestamp when the testimonial was created.
 * @property {string} updatedAt - The timestamp when the testimonial was last updated.
 */
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}