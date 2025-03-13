import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "primary" | "secondary" | "success" | "warning";
}

export function ToolCard({ 
  title, 
  description, 
  href, 
  icon: Icon, 
  variant = "primary" 
}: ToolCardProps) {

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
            <div className={cn("rounded-md p-2", variants[variant].bg)}>
              <Icon className={cn("h-6 w-6", variants[variant].text)} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}