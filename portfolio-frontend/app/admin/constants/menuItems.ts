import {
  LayoutDashboard,
  Languages,
  Link2,
  AudioWaveform,
  Film,
  Images,
  LayoutGrid,
  Newspaper,
  User,
  Mail,
  Shield,
  Settings,
  Database,
  Activity,
  Users,
  Server,
} from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    id: "content",
    label: "Content Management",
    icon: LayoutGrid,
    children: [
      { id: "language", label: "Language", icon: Languages },
      { id: "link", label: "Links", icon: Link2 },
      { id: "audio", label: "Music", icon: AudioWaveform },
      { id: "video", label: "Video", icon: Film },
      { id: "marquee", label: "Marquee", icon: Images },
    ],
  },
  {
    id: "pages",
    label: "Pages",
    icon: Newspaper,
    children: [
      { id: "cardprojects", label: "Card Home / Project", icon: LayoutGrid },
      { id: "detailprojects", label: "Detail Projects", icon: Newspaper },
      { id: "about", label: "About", icon: User },
      { id: "contact", label: "Contact", icon: Mail },
    ],
  },
  {
    id: "superadmin",
    label: "Super Admin",
    icon: Shield,
  },
];
