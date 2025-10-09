"use client";

import SidebarLayout from "@/components/dashboard/SidebarLayout";
import {
  Users,
  Activity,
  PlusCircle,
  MessageSquare,
  Search,
  SignpostBig,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: "/jobseeker", icon: Users, label: "Dashboard" },
    { href: "/jobseeker/explore-jobs", icon: Search, label: "Explore Jobs" },
    { href: "/jobseeker/newprofile", icon: PlusCircle, label: "New Profile" },
    { href: "/jobseeker/profile", icon: Activity, label: "Profile" },
    { href: "/jobseeker/messages", icon: MessageSquare, label: "Messages" },
    {
      href: "/jobseeker/resume-coach",
      icon: SignpostBig,
      label: "Resume Coach",
    },
  ];

  return (
    <SidebarLayout items={navItems} mobileTitle="Jobseeker">
      {children}
    </SidebarLayout>
  );
}
