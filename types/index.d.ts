import { Icons } from "@/components/icons";
import type { Icon } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type MainNavItem = NavItem;

export type SiteConfig = {
  name: string;
  links: {
    github: string;
  };
};

export type MarketingConfig = {
  mainNav: MainNavItem[];
};
