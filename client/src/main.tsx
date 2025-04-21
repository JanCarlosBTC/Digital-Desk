import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { 
  BrainIcon, 
  ClipboardCheckIcon, 
  ListChecksIcon, 
  ArchiveIcon, 
  HomeIcon 
} from "lucide-react";

// Define the navigation items for the app
export const navItems = [
  {
    title: "Home",
    href: "/",
    icon: HomeIcon
  },
  {
    title: "Thinking Desk",
    href: "/thinking-desk",
    icon: BrainIcon
  },
  {
    title: "Personal Clarity System",
    href: "/personal-clarity-system",
    icon: ClipboardCheckIcon
  },
  {
    title: "Decision Log",
    href: "/decision-log",
    icon: ListChecksIcon
  },
  {
    title: "Offer Vault",
    href: "/offer-vault",
    icon: ArchiveIcon
  }
];

// Use a safer approach for hot module replacement
const rootElement = document.getElementById("root");

// Making sure we only create a root once
// @ts-expect-error - using window for development only
const root = window.__ROOT__ || (window.__ROOT__ = createRoot(rootElement!));
root.render(<App />);
