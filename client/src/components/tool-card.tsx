import { Link } from "wouter";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  title: string;
  description: string;
  subtext: string;
  icon: LucideIcon;
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
  icon: Icon, 
  href, 
  stats, 
  color 
}: ToolCardProps) => {
  const colorClasses = {
    primary: {
      bg: "bg-blue-100",
      text: "text-primary",
      hover: "hover:text-blue-700"
    },
    secondary: {
      bg: "bg-violet-500", // Updated from light violet to deeper violet to match buttons
      text: "text-white", // Changed text to white for better contrast
      hover: "hover:text-blue-700" // Changed to blue for consistency
    },
    success: {
      bg: "bg-green-100",
      text: "text-success",
      hover: "hover:text-blue-700" // Changed to blue for consistency
    },
    warning: {
      bg: "bg-amber-100",
      text: "text-warning",
      hover: "hover:text-blue-700" // Changed to blue for consistency
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center text-2xl", colorClasses[color].bg, colorClasses[color].text)}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500">{subtext}</p>
          </div>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex items-center text-sm text-gray-500 space-x-4">
          {stats.sections && (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              {stats.sections} sections
            </span>
          )}
          {stats.entries && (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              {stats.entries} entries
            </span>
          )}
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {stats.updatedText}
          </span>
        </div>
        <Link href={href} className="mt-4 inline-block font-medium text-primary hover:text-blue-700">
          Open {title} 
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default ToolCard;
