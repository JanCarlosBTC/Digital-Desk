import React, { memo, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { navItems } from "@/main";
import { useUser } from "@/context/user-context";
import { CreditCard, LogOut, Settings, User, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Sidebar = () => {
  const [location] = useLocation();
  const { user, isLoading, logout } = useUser();

  // Memoize nav items to prevent re-rendering
  const navigationItems = useMemo(() => {
    return (
      <ul className="space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <li key={item.href}>
              <Link 
                href={item.href}
                className={cn(
                  "flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-md font-medium transition-colors",
                  isActive && "bg-blue-50 text-primary"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="w-5 h-5 mr-3 text-primary" aria-hidden="true" />
                <span>{item.title}</span>
              </Link>
            </li>
          );
        })}
        
{/* Subscription plans link removed */}
      </ul>
    );
  }, [location]);

  // User profile section
  const renderUserProfile = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex items-center p-2">
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse mr-3 flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      );
    }
    
    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center w-full px-2 justify-start h-auto">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{user.name}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
{/* Subscription menu item removed */}
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={logout}
              className="text-red-600 focus:text-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    
    // Fallback user profile
    return (
      <div className="flex items-center p-2">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarFallback className="bg-primary text-primary-foreground">
            JD
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">John Doe</p>
        </div>
      </div>
    );
  }, [user, isLoading, logout]);

  return (
    <aside className="bg-white shadow-md z-10 border-r border-gray-200 w-64 flex-shrink-0 hidden md:flex md:flex-col h-screen">
      <div className="p-4 border-b border-gray-200">
        <Link href="/" className="block">
          <h1 className="text-2xl font-bold text-primary">Digital Desk</h1>
          <p className="text-sm text-gray-500">Clarity Client Hub</p>
        </Link>
      </div>
      
      <nav className="p-2 flex-1 overflow-y-auto">
        {navigationItems}
      </nav>
      
      <div className="p-2 border-t border-gray-200">
        {renderUserProfile}
      </div>
    </aside>
  );
};

export default memo(Sidebar);
