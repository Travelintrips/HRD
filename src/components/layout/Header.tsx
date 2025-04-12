import React, { useState, useEffect } from "react";
import {
  Bell,
  Search,
  ChevronDown,
  Settings,
  LogIn,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  notifications?: Array<{ id: string; title: string; read: boolean }>;
}

const Header = ({
  userName,
  userRole = "HR Administrator",
  userAvatar = "",
  notifications = [
    { id: "1", title: "New leave request from Sarah", read: false },
    { id: "2", title: "5 employees are late today", read: false },
    { id: "3", title: "Monthly attendance report ready", read: true },
  ],
}: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Format the current time and date
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const handleViewAllNotifications = () => {
    console.log("Viewing all notifications");
    // Here you would navigate to the notifications page or open a modal
    navigate("/notifications");
  };

  const handleNotificationClick = (id: string) => {
    console.log(`Clicked on notification with ID: ${id}`);
    // Here you would mark the notification as read and possibly navigate to related content
    // Example: await api.notifications.markAsRead(id);
    navigate(`/notifications/${id}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Searching for: ${searchQuery}`);
    // Here you would perform a search and display results
    // Example: const results = await api.search(searchQuery);
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 h-20 px-6 flex items-center justify-between w-full">
      <div className="flex items-center space-x-4 w-1/3">
        <div className="relative w-full max-w-md">
          <form onSubmit={handleSearch}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search employees, shifts..."
              className="pl-10 pr-4 py-2 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="text-xl font-semibold text-gray-800">{currentTime}</div>
        <div className="text-sm text-gray-500">{currentDate}</div>
      </div>

      <div className="flex items-center space-x-6 w-1/3 justify-end">
        {user ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadNotificationsCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                      {unreadNotificationsCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="py-4 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={cn(
                        "py-3 px-4 cursor-pointer",
                        !notification.read && "bg-gray-50 font-medium",
                      )}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="flex items-start">
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 mr-2" />
                        )}
                        <span>{notification.title}</span>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="py-2 justify-center font-medium text-blue-600"
                  onClick={handleViewAllNotifications}
                >
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 px-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={userAvatar}
                      alt={user.email || userName || ""}
                    />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {(user.email || userName || "U")
                        .split("@")[0]
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {user.email?.split("@")[0] || userName || "User"}
                    </span>
                    <span className="text-xs text-gray-500">{userRole}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className="flex items-center space-x-1"
              onClick={handleLogin}
            >
              <LogIn className="h-4 w-4 mr-1" />
              Login
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-1"
              onClick={handleRegister}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Register
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
