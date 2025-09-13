"use client";

import SidebarLayout from "@/components/dashboard/SidebarLayout";
import { Users, Activity, PlusCircle, MessageSquare } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: "/jobseeker", icon: Users, label: "Dashboard" },
    { href: "/jobseeker/newprofile", icon: PlusCircle, label: "New Profile" },
    { href: "/jobseeker/profile", icon: Activity, label: "Profile" },
    { href: "/jobseeker/messages", icon: MessageSquare, label: "Messages" },
  ];

  return (
    <SidebarLayout items={navItems} mobileTitle="Jobseeker">
      {children}
    </SidebarLayout>
  );
}
