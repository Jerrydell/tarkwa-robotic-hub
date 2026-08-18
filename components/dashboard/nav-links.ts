import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  User,
  Bell,
  UserPlus,
  MessageSquare,
  FolderKanban,
  MessageCircle,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  minRole?: "club_member" | "super_admin";
}

export const DASHBOARD_NAV_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/learn", label: "My Learning", icon: BookOpen },
  { href: "/dashboard/progress", label: "Progress & Badges", icon: Trophy },
  { href: "/dashboard/community", label: "Community", icon: MessageSquare },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/chat", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/updates", label: "Internal Updates", icon: Megaphone, minRole: "club_member" },
  { href: "/dashboard/membership", label: "Club Membership", icon: UserPlus },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];
