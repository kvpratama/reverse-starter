import { v4 as uuidv4 } from 'uuid';
import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { users, role } from './schema';
import { hashPassword } from '@/lib/auth/session';

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...');

  const baseProduct = await stripe.products.create({
    name: 'Base',
    description: 'Base subscription plan',
  });

  await stripe.prices.create({
    product: baseProduct.id,
    unit_amount: 800, // $8 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  const plusProduct = await stripe.products.create({
    name: 'Plus',
    description: 'Plus subscription plan',
  });

  await stripe.prices.create({
    product: plusProduct.id,
    unit_amount: 1200, // $12 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  console.log('Stripe products and prices created successfully.');
}

async function seed() {
  const password = 'admin123';
  const passwordHash = await hashPassword(password);

  // insert roles for admin, job seeker, recruiter
  const [roles] = await db
    .insert(role)
    .values([
      {
        id: 0,
        role: 'admin',
        route: '/admin',
      },
      {
        id: 1,
        role: 'Job Seeker',
        route: '/jobseeker',
      },
      {
        id: 2,
        role: 'Recruiter',
        route: '/recruiter',
      },
    ])
    .returning();

  console.log('Initial roles created.');

  const [user] = await db
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
        email: "recruiter@test.com",
        passwordHash: passwordHash,
        roleId: 2,
      },
    ])
    .returning();

  console.log('Initial users created.');

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
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
