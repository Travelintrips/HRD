import React from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  Home,
  Users,
  Calendar,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarLink = ({
  icon,
  label,
  href,
  active = false,
}: SidebarLinkProps) => {
  return (
    <Link to={href} className="w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 pl-4 mb-1 text-gray-500 hover:text-primary hover:bg-gray-100/50",
          active && "bg-gray-100 text-primary font-medium",
        )}
      >
        {icon}
        <span>{label}</span>
        {active && <ChevronRight className="ml-auto h-4 w-4" />}
      </Button>
    </Link>
  );
};

interface SidebarProps {
  activePath?: string;
}

const Sidebar = ({ activePath = "/" }: SidebarProps) => {
  const navLinks = [
    { icon: <Home className="h-5 w-5" />, label: "Dashboard", href: "/" },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Employee Management",
      href: "/employees",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Shift Management",
      href: "/shifts",
    },
    {
      icon: <ClipboardList className="h-5 w-5" />,
      label: "Leave Management",
      href: "/leaves",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Reports",
      href: "/reports",
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      label: "Freelance",
      href: "/freelance",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      href: "/settings",
    },
  ];

  return (
    <div className="w-[280px] h-full bg-white border-r flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <span>HRD Attendance</span>
        </h1>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navLinks.map((link) => (
            <SidebarLink
              key={link.href}
              icon={link.icon}
              label={link.label}
              href={link.href}
              active={activePath === link.href}
            />
          ))}
        </div>
      </nav>

      <div className="p-4 border-t mt-auto">
        <div className="flex items-center gap-3 mb-4">
          <Avatar>
            <AvatarImage
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
              alt="Admin User"
            />
            <AvatarFallback>AU</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">Admin User</p>
            <p className="text-xs text-gray-500">admin@company.com</p>
          </div>
        </div>
        <Button variant="outline" className="w-full gap-2 text-gray-600">
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
