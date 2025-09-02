import {
  pgTable,
  pgEnum,
  uuid,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  doublePrecision,
  boolean,
  inet,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const experienceLevelEnum = pgEnum("experience_level", [
  "entry",
  "mid",
  "senior",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "applied",
  "interview",
  "offer",
  "rejected",
  "hired",
  "contacted",
  "shortlisted",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  roleId: integer("role_id").notNull().default(0).references(() => roles.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  role: varchar("role", { length: 20 }).notNull(),
  route: varchar("route", { length: 20 }),
});

export const jobseekersProfile = pgTable("jobseekers_profile", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  profileName: varchar("profile_name", { length: 100 }),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull(),
  resumeUrl: varchar("resume_url", { length: 255 }).notNull(),
  bio: text("bio"),
  skills: text("skills"),
  experience: experienceLevelEnum("experience").notNull(),
  desiredSalary: integer("desired_salary"),
  jobRoleId: uuid("job_role_id").references(() => jobRoles.id),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const jobPosts = pgTable("job_posts", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  jobTitle: varchar("job_title", { length: 128 }),
  jobDescription: text("job_description"),
  jobRequirements: text("job_requirements"),
  perks: text("perks"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const jobPostsCandidate = pgTable(
  "job_posts_candidate",
  {
    id: uuid("id").primaryKey(),
    profileId: uuid("profile_id").references(() => jobseekersProfile.id),
    jobPostId: uuid("job_post_id").references(() => jobPosts.id),
    similarityScore: doublePrecision("similarity_score"),
    status: jobStatusEnum("status").default("shortlisted"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    uniqueApplication: uniqueIndex("unique_application").on(
      table.profileId,
      table.jobPostId,
    ),
  }),
);

// export const teams = pgTable('teams', {
//   id: serial('id').primaryKey(),
//   name: varchar('name', { length: 100 }).notNull(),
//   createdAt: timestamp('created_at').notNull().defaultNow(),
//   updatedAt: timestamp('updated_at').notNull().defaultNow(),
//   stripeCustomerId: text('stripe_customer_id').unique(),
//   stripeSubscriptionId: text('stripe_subscription_id').unique(),
//   stripeProductId: text('stripe_product_id'),
//   planName: varchar('plan_name', { length: 50 }),
//   subscriptionStatus: varchar('subscription_status', { length: 20 }),
// });

// export const teamMembers = pgTable('team_members', {
//   id: serial('id').primaryKey(),
//   userId: integer('user_id')
//     .notNull()
//     .references(() => users.id),
//   teamId: integer('team_id')
//     .notNull()
//     .references(() => teams.id),
//   role: varchar('role', { length: 50 }).notNull(),
//   joinedAt: timestamp('joined_at').notNull().defaultNow(),
// });

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  // teamId: integer('team_id')
  //   .notNull()
  //   .references(() => teams.id),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
});

// export const invitations = pgTable('invitations', {
//   id: serial('id').primaryKey(),
//   teamId: integer('team_id')
//     .notNull()
//     .references(() => teams.id),
//   email: varchar('email', { length: 255 }).notNull(),
//   role: varchar('role', { length: 50 }).notNull(),
//   invitedBy: integer('invited_by')
//     .notNull()
//     .references(() => users.id),
//   invitedAt: timestamp('invited_at').notNull().defaultNow(),
//   status: varchar('status', { length: 20 }).notNull().default('pending'),
// });

// export const teamsRelations = relations(teams, ({ many }) => ({
//   teamMembers: many(teamMembers),
//   activityLogs: many(activityLogs),
//   invitations: many(invitations),
// }));

// export const usersRelations = relations(users, ({ many }) => ({
//   teamMembers: many(teamMembers),
//   invitationsSent: many(invitations),
// }));

export const roleRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));

// one user can have many jobseekers profiles
export const jobseekersProfileRelations = relations(users, ({ one }) => ({
  jobseekersProfile: one(jobseekersProfile),
}));

// one user can have many job posts
export const jobPostsRelations = relations(users, ({ one }) => ({
  jobPosts: one(jobPosts),
}));

// one user can have many job posts candidates
export const jobPostsCandidateRelations = relations(
  jobseekersProfile,
  ({ one }) => ({
    jobPostsCandidate: one(jobPostsCandidate),
  }),
);

// export const invitationsRelations = relations(invitations, ({ one }) => ({
//   team: one(teams, {
//     fields: [invitations.teamId],
//     references: [teams.id],
//   }),
//   invitedBy: one(users, {
//     fields: [invitations.invitedBy],
//     references: [users.id],
//   }),
// }));

// export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
//   user: one(users, {
//     fields: [teamMembers.userId],
//     references: [users.id],
//   }),
//   team: one(teams, {
//     fields: [teamMembers.teamId],
//     references: [teams.id],
//   }),
// }));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  // team: one(teams, {
  //   fields: [activityLogs.teamId],
  //   references: [teams.id],
  // }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
// export type Team = typeof teams.$inferSelect;
// export type NewTeam = typeof teams.$inferInsert;
// export type TeamMember = typeof teamMembers.$inferSelect;
// export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type JobPost = typeof jobPosts.$inferSelect;
export type NewJobPost = typeof jobPosts.$inferInsert;
export type JobPostCandidate = typeof jobPostsCandidate.$inferSelect;
export type NewJobPostCandidate = typeof jobPostsCandidate.$inferInsert;
// export type Invitation = typeof invitations.$inferSelect;
// export type NewInvitation = typeof invitations.$inferInsert;
// export type TeamDataWithMembers = Team & {
//   teamMembers: (TeamMember & {
//     user: Pick<User, 'id' | 'name' | 'email'>;
//   })[];
// };

export enum ActivityType {
  SIGN_UP = "SIGN_UP",
  SIGN_IN = "SIGN_IN",
  SIGN_OUT = "SIGN_OUT",
  UPDATE_PASSWORD = "UPDATE_PASSWORD",
  DELETE_ACCOUNT = "DELETE_ACCOUNT",
  UPDATE_ACCOUNT = "UPDATE_ACCOUNT",
  // CREATE_TEAM = 'CREATE_TEAM',
  // REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  // INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  // ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}

// Job categorization hierarchy
export const jobCategories = pgTable("job_categories", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const jobSubcategories = pgTable("job_subcategories", {
  id: uuid("id").primaryKey(),
  categoryId: uuid("category_id").references(() => jobCategories.id),
  name: varchar("name", { length: 100 }).notNull(),
});

export const jobRoles = pgTable("job_roles", {
  id: uuid("id").primaryKey(),
  subcategoryId: uuid("subcategory_id").references(() => jobSubcategories.id),
  name: varchar("name", { length: 100 }).notNull(),
});

// Jobseeker details
export const jobseekersWorkExperience = pgTable("jobseekers_work_experience", {
  id: uuid("id").primaryKey(),
  profileId: uuid("profile_id").references(() => jobseekersProfile.id),
  startDate: varchar("start_date", { length: 100 }),
  endDate: varchar("end_date", { length: 100 }),
  position: varchar("position", { length: 100 }),
  company: varchar("company", { length: 100 }),
  description: text("description"),
});

export const jobseekersEducation = pgTable("jobseekers_education", {
  id: uuid("id").primaryKey(),
  profileId: uuid("profile_id").references(() => jobseekersProfile.id),
  startDate: varchar("start_date", { length: 100 }),
  endDate: varchar("end_date", { length: 100 }),
  degree: varchar("degree", { length: 100 }),
  institution: varchar("institution", { length: 100 }),
  fieldOfStudy: varchar("field_of_study", { length: 100 }),
  description: text("description"),
});
