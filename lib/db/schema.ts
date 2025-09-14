import {
  pgTable,
  pgEnum,
  uuid,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  doublePrecision,
  boolean,
  unique,
  index,
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

// Core tables
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  role: varchar("role", { length: 20 }).notNull(),
  route: varchar("route", { length: 20 }),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 100 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    roleId: integer("role_id")
      .notNull()
      .default(0)
      .references(() => roles.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
      index("idx_users_email").on(table.email),
      index("idx_users_role_id").on(table.roleId),
  ]
);

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
});

// Job categorization hierarchy
export const jobCategories = pgTable("job_categories", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const jobSubcategories = pgTable(
  "job_subcategories",
  {
    id: uuid("id").primaryKey(),
    categoryId: uuid("category_id").references(() => jobCategories.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 100 }).notNull(),
  },
  (table) => [
    index("idx_job_subcategories_category_id").on(table.categoryId),
  ]
);

export const jobRoles = pgTable(
  "job_roles",
  {
    id: uuid("id").primaryKey(),
    subcategoryId: uuid("subcategory_id").references(() => jobSubcategories.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 100 }).notNull(),
  },
  (table) => [
    index("idx_job_roles_subcategory_id").on(table.subcategoryId),
  ]
);

// Jobseeker profile and related tables
export const jobseekersProfile = pgTable(
  "jobseekers_profile",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id),
    profileName: varchar("profile_name", { length: 100 }),
    name: varchar("name", { length: 100 }),
    email: varchar("email", { length: 255 }).notNull(),
    nationality: varchar("nationality", { length: 50 }),
    visaStatus: varchar("visa_status", { length: 20 }),
    age: integer("age"),
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
  },
  (table) => [
    index("idx_jobseekers_profile_user_id").on(table.userId),
    index("idx_jobseekers_profile_job_role_id").on(table.jobRoleId),
  ]
);

export const jobseekersWorkExperience = pgTable(
  "jobseekers_work_experience",
  {
    id: uuid("id").primaryKey(),
    profileId: uuid("profile_id").references(() => jobseekersProfile.id, {
      onDelete: "cascade",
    }),
    startDate: varchar("start_date", { length: 100 }),
    endDate: varchar("end_date", { length: 100 }),
    position: varchar("position", { length: 100 }),
    company: varchar("company", { length: 100 }),
    description: text("description"),
  },
  (table) => [
    index("idx_jobseekers_work_experience_profile_id").on(table.profileId),
  ]
);

export const jobseekersEducation = pgTable(
  "jobseekers_education",
  {
    id: uuid("id").primaryKey(),
    profileId: uuid("profile_id").references(() => jobseekersProfile.id, {
      onDelete: "cascade",
    }),
    startDate: varchar("start_date", { length: 100 }),
    endDate: varchar("end_date", { length: 100 }),
    degree: varchar("degree", { length: 100 }),
    institution: varchar("institution", { length: 100 }),
    fieldOfStudy: varchar("field_of_study", { length: 100 }),
    description: text("description"),
  },
  (table) => [
    index("idx_jobseekers_education_profile_id").on(table.profileId),
  ]
);

// Job posts and applications
export const jobPosts = pgTable(
  "job_posts",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id),
    companyName: varchar("company_name", { length: 128 }),
    companyProfile: text("company_profile"),
    jobTitle: varchar("job_title", { length: 128 }),
    jobLocation: varchar("job_location", { length: 128 }),
    jobDescription: text("job_description"),
    jobRequirements: text("job_requirements"),
    perks: text("perks"),
    jobRoleId: uuid("job_role_id").references(() => jobRoles.id),
    coreSkills: text("core_skills"),
    niceToHaveSkills: text("nice_to_have_skills"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("idx_job_posts_user_id").on(table.userId),
    index("idx_job_posts_job_role_id").on(table.jobRoleId),
  ]
);

export const jobPostsCandidate = pgTable(
  "job_posts_candidate",
  {
    id: uuid("id").primaryKey(),
    profileId: uuid("profile_id").references(() => jobseekersProfile.id),
    jobPostId: uuid("job_post_id").references(() => jobPosts.id),
    similarityScore: doublePrecision("similarity_score"),
    similarityScoreBio: doublePrecision("similarity_score_bio"),
    similarityScoreSkills: doublePrecision("similarity_score_skills"),
    status: jobStatusEnum("status").default("shortlisted"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    unique("unique_application").on(table.profileId, table.jobPostId),
    index("idx_job_posts_candidate_profile_id").on(table.profileId),
    index("idx_job_posts_candidate_job_post_id").on(table.jobPostId),
    index("idx_job_posts_candidate_status").on(table.status),
  ]
);

// Relations
export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  jobseekersProfile: many(jobseekersProfile),
  jobPosts: many(jobPosts),
  activityLogs: many(activityLogs),
}));

export const jobCategoriesRelations = relations(jobCategories, ({ many }) => ({
  subcategories: many(jobSubcategories),
}));

export const jobSubcategoriesRelations = relations(jobSubcategories, ({ one, many }) => ({
  category: one(jobCategories, {
    fields: [jobSubcategories.categoryId],
    references: [jobCategories.id],
  }),
  roles: many(jobRoles),
}));

export const jobRolesRelations = relations(jobRoles, ({ one, many }) => ({
  subcategory: one(jobSubcategories, {
    fields: [jobRoles.subcategoryId],
    references: [jobSubcategories.id],
  }),
  jobseekersProfiles: many(jobseekersProfile),
  jobPosts: many(jobPosts),
}));

export const jobseekersProfileRelations = relations(jobseekersProfile, ({ one, many }) => ({
  user: one(users, {
    fields: [jobseekersProfile.userId],
    references: [users.id],
  }),
  jobRole: one(jobRoles, {
    fields: [jobseekersProfile.jobRoleId],
    references: [jobRoles.id],
  }),
  workExperience: many(jobseekersWorkExperience),
  education: many(jobseekersEducation),
  applications: many(jobPostsCandidate),
}));

export const jobseekersWorkExperienceRelations = relations(jobseekersWorkExperience, ({ one }) => ({
  profile: one(jobseekersProfile, {
    fields: [jobseekersWorkExperience.profileId],
    references: [jobseekersProfile.id],
  }),
}));

export const jobseekersEducationRelations = relations(jobseekersEducation, ({ one }) => ({
  profile: one(jobseekersProfile, {
    fields: [jobseekersEducation.profileId],
    references: [jobseekersProfile.id],
  }),
}));

export const jobPostsRelations = relations(jobPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [jobPosts.userId],
    references: [users.id],
  }),
  jobRole: one(jobRoles, {
    fields: [jobPosts.jobRoleId],
    references: [jobRoles.id],
  }),
  candidates: many(jobPostsCandidate),
}));

export const jobPostsCandidateRelations = relations(jobPostsCandidate, ({ one }) => ({
  profile: one(jobseekersProfile, {
    fields: [jobPostsCandidate.profileId],
    references: [jobseekersProfile.id],
  }),
  jobPost: one(jobPosts, {
    fields: [jobPostsCandidate.jobPostId],
    references: [jobPosts.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

export type JobCategory = typeof jobCategories.$inferSelect;
export type NewJobCategory = typeof jobCategories.$inferInsert;
export type JobSubcategory = typeof jobSubcategories.$inferSelect;
export type NewJobSubcategory = typeof jobSubcategories.$inferInsert;
export type JobRole = typeof jobRoles.$inferSelect;
export type NewJobRole = typeof jobRoles.$inferInsert;

export type JobseekersProfile = typeof jobseekersProfile.$inferSelect;
export type NewJobseekersProfile = typeof jobseekersProfile.$inferInsert;
export type JobseekersWorkExperience = typeof jobseekersWorkExperience.$inferSelect;
export type NewJobseekersWorkExperience = typeof jobseekersWorkExperience.$inferInsert;
export type JobseekersEducation = typeof jobseekersEducation.$inferSelect;
export type NewJobseekersEducation = typeof jobseekersEducation.$inferInsert;

export type JobPost = typeof jobPosts.$inferSelect;
export type NewJobPost = typeof jobPosts.$inferInsert;
export type JobPostCandidate = typeof jobPostsCandidate.$inferSelect;
export type NewJobPostCandidate = typeof jobPostsCandidate.$inferInsert;

// Activity types enum
export enum ActivityType {
  SIGN_UP = "SIGN_UP",
  SIGN_IN = "SIGN_IN",
  SIGN_OUT = "SIGN_OUT",
  UPDATE_PASSWORD = "UPDATE_PASSWORD",
  DELETE_ACCOUNT = "DELETE_ACCOUNT",
  UPDATE_ACCOUNT = "UPDATE_ACCOUNT",
  CREATE_PROFILE = "CREATE_PROFILE",
  UPDATE_PROFILE = "UPDATE_PROFILE",
  CREATE_JOB_POST = "CREATE_JOB_POST",
  UPDATE_JOB_POST = "UPDATE_JOB_POST",
  APPLY_TO_JOB = "APPLY_TO_JOB",
}