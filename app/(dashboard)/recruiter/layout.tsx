"use client";

import SidebarLayout from "@/components/dashboard/SidebarLayout";
import { Users, Briefcase } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: "/recruiter", icon: Users, label: "Dashboard" },
    { href: "/recruiter/post-a-job", icon: Briefcase, label: "Post a Job" },
    { href: "/recruiter/my-job-postings", icon: Briefcase, label: "My Job Postings" },
  ];

  return (
    <SidebarLayout items={navItems} mobileTitle="Recruiter">
      {children}
    </SidebarLayout>
  );
}
