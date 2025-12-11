import { db } from '@/lib/db';

async function main() {
  const count = await db.course.count();
  console.log(`Course count: ${count}`);

  if (count === 0) {
    console.log("Seeding...");
    let instructor = await db.user.findFirst({
        where: { email: "alavi@kttc.edu.ir" }
    });

    if (!instructor) {
        instructor = await db.user.create({
        data: {
            name: "Dr. Alavi",
            email: "alavi@kttc.edu.ir",
            role: "admin",
            password: "hash"
        }
        });
    }

    await db.course.create({
      data: {
        title: "Modern Teaching Methods",
        description: "Learn the latest in teaching.",
        category: "Teaching Skills",
        level: "Beginner",
        duration: "4 weeks",
        price: "$199",
        instructorId: instructor.id
      }
    });
    console.log("Seeded one course.");
  }
}

main().catch(console.error);
