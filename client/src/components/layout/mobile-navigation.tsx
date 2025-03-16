import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { navItems } from "@/main";

const MobileNavigation = () => {
  const [location] = useLocation();

  return (
    <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex flex-col items-center p-3",
              location === item.href ? "text-primary" : "text-gray-500 hover:text-primary"
            )}
          >
            <item.icon className="text-lg h-5 w-5" />
            <span className="text-xs mt-1">{item.title.split(' ')[0]}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;
