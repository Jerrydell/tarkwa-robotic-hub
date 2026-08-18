import {
  LayoutDashboard,
  Users,
  UserPlus,
  BookOpen,
  FolderKanban,
  CalendarDays,
  Library,
  Megaphone,
  Image as ImageIcon,
  MessageSquare,
  Mail,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/membership", label: "Membership", icon: UserPlus },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/learning/modules", label: "Learning", icon: BookOpen },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/resources", label: "Resources", icon: Library },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/community", label: "Moderation", icon: MessageSquare },
  { href: "/admin/contact", label: "Contact Messages", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];
