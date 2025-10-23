import type { Route } from "next";

export const ROUTES = {
  jobseeker: "/jobseeker" as Route,
  jobs: "/jobseeker/explore-jobs" as Route,
  job: (id: string): Route =>
    (`/jobseeker/explore-jobs/${encodeURIComponent(id)}` as Route),
  jobsWithQuery: (
    q: Record<string, string | number | boolean | undefined | null>
  ): Route => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(q)) {
      if (value === undefined || value === null) continue;
      const str = String(value);
      if (str.length === 0) continue;
      params.set(key, str);
    }
    const query = params.toString();
    return (
      `${ROUTES.jobs}${query ? `?${query}` : ""}` as Route
    );
  },
} as const;
