import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { navItems } from "@/main";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

const Sidebar = () => {
  const [location] = useLocation();
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/user'],
  });

  return (
    <aside className="bg-white shadow-md z-10 border-r border-gray-200 w-64 flex-shrink-0 hidden md:flex md:flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary">Digital Desk</h1>
        <p className="text-sm text-gray-500">Clarity Client Hub</p>
      </div>
      
      <nav className="p-2 flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href}
                className={cn(
                  "flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-md font-medium transition-colors",
                  location === item.href && "bg-blue-50 text-primary"
                )}
              >
                <item.icon className="w-5 h-5 mr-3 text-primary" />
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        {isLoading ? (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse mr-3"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center text-gray-700">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
              <span>{user.initials}</span>
            </div>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{user.plan} Plan</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center text-gray-700">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
              <span>JD</span>
            </div>
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-xs text-gray-500">Premium Plan</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
