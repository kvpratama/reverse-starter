"use client";

import SidebarLayout from "@/components/dashboard/SidebarLayout";
import { Users, Activity, PlusCircle } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: "/jobseeker", icon: Users, label: "Dashboard" },
    { href: "/jobseeker/profile", icon: Activity, label: "Profile" },
    { href: "/jobseeker/newprofile", icon: PlusCircle, label: "New Profile" },
  ];

  return (
    <SidebarLayout items={navItems} mobileTitle="Jobseeker">
      {children}
    </SidebarLayout>
  );
}
