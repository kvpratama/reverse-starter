import { v4 as uuidv4 } from "uuid";
import { stripe } from "../payments/stripe";
import { db } from "./drizzle";
import {
  users,
  roles,
  jobCategories,
  jobSubcategories,
  jobRoles,
} from "./schema";
import { hashPassword } from "@/lib/auth/session";
import jobCategoriesJson from "@/lib/job-categories.json";

// async function createStripeProducts() {
//   console.log("Creating Stripe products and prices...");

//   const baseProduct = await stripe.products.create({
//     name: "Base",
//     description: "Base subscription plan",
//   });

//   await stripe.prices.create({
//     product: baseProduct.id,
//     unit_amount: 800, // $8 in cents
//     currency: "usd",
//     recurring: {
//       interval: "month",
//       trial_period_days: 7,
//     },
//   });

//   const plusProduct = await stripe.products.create({
//     name: "Plus",
//     description: "Plus subscription plan",
//   });

//   await stripe.prices.create({
//     product: plusProduct.id,
//     unit_amount: 1200, // $12 in cents
//     currency: "usd",
//     recurring: {
//       interval: "month",
//       trial_period_days: 7,
//     },
//   });

//   console.log("Stripe products and prices created successfully.");
// }

async function seedJobCategories() {
  console.log("Seeding job categories from JSON...");

  // JSON structure: { [category: string]: { [subcategory: string]: string[] } }
  const json = jobCategoriesJson as Record<string, Record<string, string[]>>;

  const categoriesToInsert: { id: string; name: string }[] = [];
  const subcategoriesToInsert: {
    id: string;
    categoryId: string;
    name: string;
  }[] = [];
  const rolesToInsert: { id: string; subcategoryId: string; name: string }[] =
    [];

  for (const [categoryName, subcats] of Object.entries(json)) {
    const categoryId = uuidv4();
    categoriesToInsert.push({ id: categoryId, name: categoryName });

    for (const [subcatName, rolesArr] of Object.entries(subcats)) {
      const subcatId = uuidv4();
      subcategoriesToInsert.push({
        id: subcatId,
        categoryId,
        name: subcatName,
      });

      for (const roleName of rolesArr) {
        rolesToInsert.push({
          id: uuidv4(),
          subcategoryId: subcatId,
          name: roleName,
        });
      }
    }
  }

  if (categoriesToInsert.length) {
    await db.insert(jobCategories).values(categoriesToInsert);
  }
  if (subcategoriesToInsert.length) {
    await db.insert(jobSubcategories).values(subcategoriesToInsert);
  }
  if (rolesToInsert.length) {
    await db.insert(jobRoles).values(rolesToInsert);
  }

  console.log(
    `Seeded: ${categoriesToInsert.length} categories, ${subcategoriesToInsert.length} subcategories, ${rolesToInsert.length} roles.`,
  );
}

async function seed() {
  const password = "admin123";
  const passwordHash = await hashPassword(password);

  // insert roles for admin, job seeker, recruiter
  const insertedRoles = await db
    .insert(roles)
    .values([
      {
        id: 0,
        role: "admin",
        route: "/admin",
      },
      {
        id: 1,
        role: "Job Seeker",
        route: "/jobseeker",
      },
      {
        id: 2,
        role: "Recruiter",
        route: "/recruiter",
      },
    ])
    .returning();

  console.log("Initial roles created.", insertedRoles.length);

  const insertedUser = await db
    .insert(users)
    .values([
      {
        id: uuidv4(),
        email: "admin@test.com",
        passwordHash: passwordHash,
        roleId: 0,
      },
      {
        id: uuidv4(),
        email: "jobseeker@test.com",
        passwordHash: passwordHash,
        roleId: 1,
      },
      {
        id: uuidv4(),
        email: "jobseeker2@test.com",
        passwordHash: passwordHash,
        roleId: 1,
      },
      {
        id: uuidv4(),
        email: "recruiter@test.com",
        passwordHash: passwordHash,
        roleId: 2,
      },
    ])
    .returning();

  console.log("Initial users created.");

  await seedJobCategories();

  // const [jobseekerProfile] = await db
  //   .insert(jobseekersProfile)
  //   .values([
  //     {
  //       id: uuidv4(),
  //       userId: insertedUser[1].id,
  //       profileName: "Sales Profile",
  //       name: "Job Seeker",
  //       email: "jobseeker@test.com",
  //       resumeUrl: "https://example.com/resume.pdf",
  //       bio: "I am a sales person with 5 years of experience",
  //       skills: "Sales, Marketing, Communication, Negotiation",
  //       experience: "entry",
  //       desiredSalary: 800,
  //     },
  //     {
  //       id: uuidv4(),
  //       userId: insertedUser[1].id,
  //       profileName: "Marketing Profile",
  //       name: "Job Seeker",
  //       email: "jobseeker@test.com",
  //       resumeUrl: "https://example.com/resume.pdf",
  //       bio: "I am a marketing person with passion in digital marketing",
  //       skills: "Marketing, Communication, SEO, Social Media",
  //       experience: "mid",
  //       desiredSalary: 1000,
  //     },
  //     {
  //       id: uuidv4(),
  //       userId: insertedUser[2].id,
  //       profileName: "Software Engineer Profile",
  //       name: "Job Seeker 2",
  //       email: "jobseeker2@test.com",
  //       resumeUrl: "https://example.com/resume.pdf",
  //       bio: "I am a software engineer with 5 years of experience",
  //       skills: "Python, Django, Flask, JavaScript, React, Node.js, Express.js",
  //       experience: "senior",
  //       desiredSalary: 1500,
  //     },
  //     {
  //       id: uuidv4(),
  //       userId: insertedUser[2].id,
  //       profileName: "Web Developer Profile",
  //       name: "Job Seeker 2",
  //       email: "jobseeker2@test.com",
  //       resumeUrl: "https://example.com/resume.pdf",
  //       bio: "I am a web developer experienced in building dynamic and responsive websites",
  //       skills: "HTML, CSS, JavaScript, React, Node.js, Express.js",
  //       experience: "senior",
  //       desiredSalary: 1700,
  //     },
  //   ])
  //   .returning();

  // console.log("Initial jobseeker profile created.");
  // const [team] = await db
  //   .insert(teams)
  //   .values({
  //     name: 'Test Team',
  //   })
  //   .returning();

  // await db.insert(teamMembers).values({
  //   teamId: team.id,
  //   userId: user.id,
  //   role: 'owner',
  // });

  // await createStripeProducts();
}

seed()
  .catch((error) => {
    console.error("Seed process failed:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seed process finished. Exiting...");
    process.exit(0);
  });
