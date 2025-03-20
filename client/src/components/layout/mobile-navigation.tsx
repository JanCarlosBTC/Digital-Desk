import React, { memo } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { navItems } from "@/main";

const MobileNavigation = () => {
  const [location] = useLocation();

  return (
    <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50 shadow-sm">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 w-full touch-manipulation transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-gray-500 hover:text-primary active:text-primary/80"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs mt-1 font-medium">{item.title.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(MobileNavigation);
