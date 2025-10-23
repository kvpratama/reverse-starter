"use client";

import SidebarLayout from "@/components/dashboard/SidebarLayout";
import {
  Users,
  Activity,
  PlusCircle,
  MessageSquare,
  Search,
  SignpostBig,
  Calendar,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: "/jobseeker", icon: Users, label: "Dashboard" },
    { href: ROUTES.jobs, icon: Search, label: "Explore Jobs" },
    { href: "/jobseeker/newprofile", icon: PlusCircle, label: "New Profile" },
    { href: "/jobseeker/profile", icon: Activity, label: "Profile" },
    {
      href: "/jobseeker/resume-coach",
      icon: SignpostBig,
      label: "Resume Coach",
    },
    { href: "/jobseeker/messages", icon: MessageSquare, label: "Messages" },
    { href: "/jobseeker/calendar", icon: Calendar, label: "Calendar" },
  ];

  return (
    <SidebarLayout items={navItems} mobileTitle="Jobseeker">
      {children}
    </SidebarLayout>
  );
}
