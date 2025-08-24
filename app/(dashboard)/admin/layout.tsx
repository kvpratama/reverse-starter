"use client";

import SidebarLayout from "@/components/dashboard/SidebarLayout";
import { Users, Briefcase, Lock, Activity } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: "/admin", icon: Users, label: "Dashboard" },
    { href: "/admin/general", icon: Briefcase, label: "General" },
    { href: "/admin/activity", icon: Activity, label: "Activity" },
    { href: "/admin/security", icon: Lock, label: "Security" },
  ];

  return (
    <SidebarLayout items={navItems} mobileTitle="Admin">
      {children}
    </SidebarLayout>
  );
}
