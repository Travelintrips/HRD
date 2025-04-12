import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Star,
  Trash,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "project" | "payment" | "deadline" | "rating" | "system";
  status: "unread" | "read";
  date: string;
  action?: string;
  actionLink?: string;
}

interface FreelanceNotificationSystemProps {
  userRole?: "admin" | "supervisor" | "freelancer";
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDeleteNotification?: (id: string) => void;
  onClearAllNotifications?: () => void;
  onUpdateNotificationSettings?: (settings: any) => void;
}

const FreelanceNotificationSystem = ({
  userRole = "freelancer",
  notifications: propNotifications = [],
  onMarkAsRead = (id: string) => {
    console.log(`Notification ${id} marked as read`);
    alert(`Notification marked as read`);
  },
  onMarkAllAsRead = () => {
    console.log("All notifications marked as read");
    alert("All notifications have been marked as read");
  },
  onDeleteNotification = (id: string) => {
    console.log(`Notification ${id} deleted`);
    alert("Notification has been deleted");
  },
  onClearAllNotifications = () => {
    console.log("All notifications cleared");
    alert("All notifications have been cleared");
  },
  onUpdateNotificationSettings = (settings: any) => {
    console.log("Notification settings updated:", settings);
    alert("Notification settings have been updated successfully");
  },
}: FreelanceNotificationSystemProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    projectAssignments: true,
    paymentUpdates: true,
    deadlineReminders: true,
    ratingRequests: true,
    systemUpdates: false,
  });

  // Mock data for notifications if none provided
  const defaultNotifications: Notification[] = [
    {
      id: "1",
      title: "New Project Available",
      message: "A new web development project is available for you to take.",
      type: "project",
      status: "unread",
      date: "2023-12-01T09:30:00",
      action: "View Project",
      actionLink: "/projects/new",
    },
    {
      id: "2",
      title: "Payment Approved",
      message:
        "Your payment of $1,200 for SEO Optimization project has been approved.",
      type: "payment",
      status: "unread",
      date: "2023-11-30T14:15:00",
      action: "View Payment",
      actionLink: "/payments/2",
    },
    {
      id: "3",
      title: "Deadline Reminder",
      message:
        "The Website Redesign project is due in 2 days. Please ensure timely completion.",
      type: "deadline",
      status: "read",
      date: "2023-11-29T10:00:00",
      action: "View Project",
      actionLink: "/projects/1",
    },
    {
      id: "4",
      title: "Rating Received",
      message:
        "You received a 5-star rating for the Logo Design project. A 10% bonus has been added to your payment.",
      type: "rating",
      status: "read",
      date: "2023-11-28T16:45:00",
      action: "View Rating",
      actionLink: "/ratings/3",
    },
    {
      id: "5",
      title: "System Update",
      message:
        "The freelance platform will be undergoing maintenance on December 5th from 2AM to 4AM UTC.",
      type: "system",
      status: "unread",
      date: "2023-11-27T11:00:00",
    },
  ];

  const notifications =
    propNotifications.length > 0 ? propNotifications : defaultNotifications;

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const filteredNotifications = (tab: string) => {
    if (tab === "all") return notifications;
    if (tab === "unread")
      return notifications.filter((n) => n.status === "unread");
    return notifications.filter((n) => n.type === tab);
  };

  const handleMarkAsRead = (id: string) => {
    onMarkAsRead(id);
  };

  const handleUpdateSettings = (key: string, value: boolean) => {
    const updatedSettings = {
      ...notificationSettings,
      [key]: value,
    };
    setNotificationSettings(updatedSettings);
    onUpdateNotificationSettings(updatedSettings);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "project":
        return <Calendar className="h-4 w-4" />;
      case "payment":
        return <DollarSign className="h-4 w-4" />;
      case "deadline":
        return <Clock className="h-4 w-4" />;
      case "rating":
        return <Star className="h-4 w-4" />;
      case "system":
        return <Settings className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Notifications</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {unreadCount} Unread
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Mark All Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAllNotifications}
              disabled={notifications.length === 0}
            >
              <Trash className="mr-1 h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 grid w-full grid-cols-6">
            <TabsTrigger value="all">
              All
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="project">Projects</TabsTrigger>
            <TabsTrigger value="payment">Payments</TabsTrigger>
            <TabsTrigger value="deadline">Deadlines</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="text-base">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleUpdateSettings("emailNotifications", checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications" className="text-base">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications in the browser
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      handleUpdateSettings("pushNotifications", checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="project-assignments" className="text-base">
                      Project Assignments
                    </Label>
                    <p className="text-sm text-gray-500">
                      Notifications about new projects
                    </p>
                  </div>
                  <Switch
                    id="project-assignments"
                    checked={notificationSettings.projectAssignments}
                    onCheckedChange={(checked) =>
                      handleUpdateSettings("projectAssignments", checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="payment-updates" className="text-base">
                      Payment Updates
                    </Label>
                    <p className="text-sm text-gray-500">
                      Notifications about payments
                    </p>
                  </div>
                  <Switch
                    id="payment-updates"
                    checked={notificationSettings.paymentUpdates}
                    onCheckedChange={(checked) =>
                      handleUpdateSettings("paymentUpdates", checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="deadline-reminders" className="text-base">
                      Deadline Reminders
                    </Label>
                    <p className="text-sm text-gray-500">
                      Notifications about upcoming deadlines
                    </p>
                  </div>
                  <Switch
                    id="deadline-reminders"
                    checked={notificationSettings.deadlineReminders}
                    onCheckedChange={(checked) =>
                      handleUpdateSettings("deadlineReminders", checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="rating-requests" className="text-base">
                      Rating Requests
                    </Label>
                    <p className="text-sm text-gray-500">
                      Notifications about ratings
                    </p>
                  </div>
                  <Switch
                    id="rating-requests"
                    checked={notificationSettings.ratingRequests}
                    onCheckedChange={(checked) =>
                      handleUpdateSettings("ratingRequests", checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system-updates" className="text-base">
                      System Updates
                    </Label>
                    <p className="text-sm text-gray-500">
                      Notifications about system maintenance
                    </p>
                  </div>
                  <Switch
                    id="system-updates"
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={(checked) =>
                      handleUpdateSettings("systemUpdates", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {["all", "unread", "project", "payment", "deadline", "rating"].map(
            (tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {filteredNotifications(tab).length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                    <Bell className="mb-2 h-10 w-10 text-gray-400" />
                    <h3 className="text-lg font-medium">No notifications</h3>
                    <p className="text-sm text-gray-500">
                      You don't have any {tab !== "all" ? tab : ""}{" "}
                      notifications at the moment.
                    </p>
                  </div>
                ) : (
                  filteredNotifications(tab).map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "relative rounded-lg border p-4 transition-all hover:bg-gray-50",
                        notification.status === "unread"
                          ? "border-blue-100 bg-blue-50"
                          : "border-gray-200",
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-full",
                              {
                                "bg-blue-100 text-blue-600":
                                  notification.type === "project",
                                "bg-green-100 text-green-600":
                                  notification.type === "payment",
                                "bg-yellow-100 text-yellow-600":
                                  notification.type === "deadline",
                                "bg-purple-100 text-purple-600":
                                  notification.type === "rating",
                                "bg-gray-100 text-gray-600":
                                  notification.type === "system",
                              },
                            )}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">
                              {notification.title}
                              {notification.status === "unread" && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 bg-blue-100 text-blue-800"
                                >
                                  New
                                </Badge>
                              )}
                            </h4>
                            <p className="mt-1 text-sm text-gray-600">
                              {notification.message}
                            </p>
                            <div className="mt-2 flex items-center space-x-4">
                              <span className="text-xs text-gray-500">
                                {formatDate(notification.date)}
                              </span>
                              {notification.action && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-xs font-medium text-blue-600"
                                >
                                  {notification.action}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          {notification.status === "unread" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 rounded-full p-0"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="sr-only">Mark as read</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 rounded-full p-0"
                            onClick={() =>
                              onDeleteNotification(notification.id)
                            }
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            ),
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FreelanceNotificationSystem;
