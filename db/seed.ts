import "dotenv/config";
import { db } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Start seeding...');

  // Create sample user
  const hashedPassword = await bcrypt.hash('amir1386', 10);
  const user = await db.user.create({
    data: {
      email: 'arush221617@gmail.com',
      password: hashedPassword,
      name: 'Arush Admin',
      role: 'admin'
    },
  });

  console.log('Created user:', user);

  // Create instructors
  const instructor1 = await db.user.create({
    data: {
      email: 'sarah.johnson@example.com',
      password: hashedPassword,
      name: 'Dr. Sarah Johnson',
      role: 'instructor'
    }
  });

  const instructor2 = await db.user.create({
    data: {
      email: 'michael.chen@example.com',
      password: hashedPassword,
      name: 'Prof. Michael Chen',
      role: 'instructor'
    }
  });

  const instructor3 = await db.user.create({
    data: {
      email: 'emily.rodriguez@example.com',
      password: hashedPassword,
      name: 'Ms. Emily Rodriguez',
      role: 'instructor'
    }
  });

  const instructor4 = await db.user.create({
    data: {
      email: 'james.wilson@example.com',
      password: hashedPassword,
      name: 'Dr. James Wilson',
      role: 'instructor'
    }
  });

  const instructor5 = await db.user.create({
    data: {
      email: 'maria.garcia@example.com',
      password: hashedPassword,
      name: 'Prof. Maria Garcia',
      role: 'instructor'
    }
  });

  // Create sample courses
  const courses = await Promise.all([
    db.course.create({
      data: {
        title: 'Modern Teaching Methodologies',
        description: 'Learn innovative teaching strategies for the 21st century classroom including project-based learning, flipped classroom, and differentiated instruction.',
        category: 'Teaching Skills',
        level: 'Intermediate',
        duration: '6 weeks',
        instructorId: instructor1.id,
        thumbnail: '/api/placeholder/300/200',
      },
    }),
    db.course.create({
      data: {
        title: 'Educational Psychology',
        description: 'Understanding student behavior, cognitive development, and learning processes. Essential for creating effective learning environments.',
        category: 'Psychology',
        level: 'Advanced',
        duration: '8 weeks',
        instructorId: instructor2.id,
        thumbnail: '/api/placeholder/300/200',
      },
    }),
    db.course.create({
      data: {
        title: 'Classroom Management',
        description: 'Effective strategies for creating positive learning environments, managing student behavior, and fostering engagement.',
        category: 'Management',
        level: 'Beginner',
        duration: '4 weeks',
        instructorId: instructor3.id,
        thumbnail: '/api/placeholder/300/200',
      },
    }),
    db.course.create({
      data: {
        title: 'Digital Literacy in Education',
        description: 'Integrating technology into teaching, using educational software, and developing digital literacy skills for modern classrooms.',
        category: 'Technology',
        level: 'Intermediate',
        duration: '5 weeks',
        instructorId: instructor4.id,
        thumbnail: '/api/placeholder/300/200',
      },
    }),
    db.course.create({
      data: {
        title: 'Curriculum Development',
        description: 'Designing effective curricula, learning objectives, and assessment strategies that align with educational standards.',
        category: 'Curriculum',
        level: 'Advanced',
        duration: '10 weeks',
        instructorId: instructor5.id,
        thumbnail: '/api/placeholder/300/200',
      },
    }),
  ]);

  console.log('Created courses:', courses);

  // Create users for certificates
  const student1 = await db.user.create({
    data: {
      email: 'fatemeh.alavi@example.com',
      password: hashedPassword,
      name: 'Fatemeh Alavi',
      role: 'user'
    }
  });

  const student2 = await db.user.create({
    data: {
      email: 'reza.mohammadi@example.com',
      password: hashedPassword,
      name: 'Reza Mohammadi',
      role: 'user'
    }
  });

  // Create sample certificates
  const certificates = await Promise.all([
    db.certificate.create({
      data: {
        certificateNo: 'KTTC-2024-0001',
        userId: student1.id,
        courseId: courses[0].id,
        createdAt: new Date('2024-03-15'),
      },
    }),
    db.certificate.create({
      data: {
        certificateNo: 'KTTC-2024-0002',
        userId: student2.id,
        courseId: courses[4].id,
        createdAt: new Date('2024-02-20'),
      },
    }),
  ]);

  console.log('Created certificates:', certificates);

  // Create sample testimonials
  const testimonials = await Promise.all([
    db.testimonial.create({
      data: {
        name: 'Fatemeh Alavi',
        role: 'Primary School Teacher',
        content: 'KTTC transformed my teaching career. The modern methodologies I learned have made my classes more engaging and effective.',
        avatar: '/api/placeholder/150/150',
      },
    }),
    db.testimonial.create({
      data: {
        name: 'Reza Mohammadi',
        role: 'High School Principal',
        content: 'The management courses at KTTC provided me with the skills needed to lead our school successfully. Highly recommended!',
        avatar: '/api/placeholder/150/150',
      },
    }),
    db.testimonial.create({
      data: {
        name: 'Maryam Kazemi',
        role: 'Educational Consultant',
        content: 'The psychology course helped me understand student behavior better. It\'s been invaluable in my consulting work.',
        avatar: '/api/placeholder/150/150',
      },
    }),
  ]);

  console.log('Created testimonials:', testimonials);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
