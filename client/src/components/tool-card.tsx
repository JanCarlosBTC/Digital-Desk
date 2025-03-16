import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface ToolCardProps {
  title: string;
  description: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  stats: {
    sections?: number;
    entries?: number;
    updatedText: string;
  };
  color: "primary" | "secondary" | "success" | "warning";
}

const ToolCard = ({ 
  title, 
  description, 
  subtext,
  href, 
  icon: Icon, 
  stats,
  color = "primary" 
}: ToolCardProps) => {

  const variants = {
    primary: {
      bg: "bg-blue-100",
      text: "text-primary",
      hover: "hover:text-blue-700"
    },
    secondary: {
      bg: "bg-violet-500", 
      text: "text-white", 
      hover: "hover:text-blue-50"
    },
    success: {
      bg: "bg-green-100",
      text: "text-green-700",
      hover: "hover:text-green-800"
    },
    warning: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      hover: "hover:text-amber-800"
    }
  };

  return (
    <Link href={href}>
      <Card className="h-full cursor-pointer transition-transform hover:scale-105">
        <div className="flex h-full flex-col p-6">
          <div className="mb-4 flex">
            <div className={cn("rounded-md p-2", variants[color].bg)}>
              <Icon className={cn("h-6 w-6", variants[color].text)} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              {stats.sections && <span className="mr-2">{stats.sections} sections</span>}
              {stats.entries && <span className="mr-2">{stats.entries} entries</span>}
              <span>{stats.updatedText}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ToolCard;