import { db } from './src/lib/db';

async function main() {
  console.log('Start seeding...');

  // Create sample courses
  const courses = await Promise.all([
    db.course.create({
      data: {
        title: 'Modern Teaching Methodologies',
        description: 'Learn innovative teaching strategies for the 21st century classroom including project-based learning, flipped classroom, and differentiated instruction.',
        category: 'Teaching Skills',
        level: 'Intermediate',
        duration: '6 weeks',
        instructor: 'Dr. Sarah Johnson',
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
        instructor: 'Prof. Michael Chen',
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
        instructor: 'Ms. Emily Rodriguez',
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
        instructor: 'Dr. James Wilson',
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
        instructor: 'Prof. Maria Garcia',
        thumbnail: '/api/placeholder/300/200',
      },
    }),
  ]);

  console.log('Created courses:', courses);

  // Create sample certificates
  const certificates = await Promise.all([
    db.certificate.create({
      data: {
        certificateNo: 'KTTC-2024-0001',
        holderName: 'Fatemeh Alavi',
        courseId: courses[0].id,
        issueDate: new Date('2024-03-15'),
        isValid: true,
      },
    }),
    db.certificate.create({
      data: {
        certificateNo: 'KTTC-2024-0002',
        holderName: 'Reza Mohammadi',
        courseId: courses[4].id,
        issueDate: new Date('2024-02-20'),
        isValid: true,
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