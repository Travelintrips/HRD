import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";

type AttendanceStatus = "present" | "late" | "absent" | "leave" | "none";

type EmployeeAttendance = {
  date: Date;
  status: AttendanceStatus;
};

interface CalendarWidgetProps {
  attendanceData?: EmployeeAttendance[];
  onDateSelect?: (date: Date) => void;
  viewMode?: "month" | "week" | "day";
}

const CalendarWidget = ({
  attendanceData = [],
  onDateSelect = () => {},
  viewMode = "month",
}: CalendarWidgetProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "week" | "day">(viewMode);

  // Generate mock attendance data if none provided
  const mockAttendanceData: EmployeeAttendance[] =
    attendanceData.length > 0
      ? attendanceData
      : [
          {
            date: new Date(new Date().setDate(new Date().getDate() - 5)),
            status: "present",
          },
          {
            date: new Date(new Date().setDate(new Date().getDate() - 4)),
            status: "present",
          },
          {
            date: new Date(new Date().setDate(new Date().getDate() - 3)),
            status: "late",
          },
          {
            date: new Date(new Date().setDate(new Date().getDate() - 2)),
            status: "absent",
          },
          {
            date: new Date(new Date().setDate(new Date().getDate() - 1)),
            status: "present",
          },
          { date: new Date(), status: "present" },
          {
            date: new Date(new Date().setDate(new Date().getDate() + 1)),
            status: "leave",
          },
          {
            date: new Date(new Date().setDate(new Date().getDate() + 2)),
            status: "leave",
          },
          {
            date: new Date(new Date().setDate(new Date().getDate() + 3)),
            status: "none",
          },
        ];

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      console.log(`Date selected: ${newDate.toISOString()}`);
      // Here you would fetch attendance/project details for the selected date
      // Example API call: const details = await api.attendance.getDetailsByDate(newDate);

      // For demonstration, we'll show an alert
      alert(
        `Menampilkan detail untuk tanggal: ${newDate.toLocaleDateString()}`,
      );

      setDate(newDate);
      onDateSelect(newDate);
    }
  };

  const getStatusForDate = (day: Date | undefined): AttendanceStatus => {
    if (!day) return "none";
    const attendance = mockAttendanceData.find(
      (item) => item.date && item.date.toDateString() === day.toDateString(),
    );
    return attendance ? attendance.status : "none";
  };

  const getStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "late":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "absent":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "leave":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      default:
        return "";
    }
  };

  const renderDayContent = (day: Date | undefined) => {
    if (!day) return null;

    const status = getStatusForDate(day);
    return (
      <div
        className={cn(
          "h-full w-full p-2 rounded-md transition-colors border border-gray-200 shadow-sm",
          getStatusColor(status),
        )}
      >
        <span className="text-base font-semibold text-black dark:text-white">
          {day.getDate()}
        </span>
      </div>
    );
  };

  const handlePrevMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - 1);
    setDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1);
    setDate(newDate);
  };

  const renderWeekView = () => {
    // Get the start of the week (Sunday)
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return (
      <div className="grid grid-cols-7 gap-2 mt-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
          (dayName, index) => (
            <div key={`header-${index}`} className="text-center font-medium">
              {dayName}
            </div>
          ),
        )}
        {days.map((day, index) => {
          const status = getStatusForDate(day);
          return (
            <div
              key={`day-${index}`}
              className={cn(
                "h-16 p-2 border rounded-md cursor-pointer",
                getStatusColor(status),
              )}
              onClick={() => handleDateChange(day)}
            >
              <div className="font-semibold text-black dark:text-white">
                {day.getDate()}
              </div>
              <div className="text-xs mt-1">
                {status !== "none" && (
                  <span className="capitalize">{status}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const status = getStatusForDate(date);
    // Reduce the number of hours shown to save resources
    const hours = [9, 12, 15, 18];

    return (
      <div className="mt-4">
        <div className="text-center mb-4">
          <div className="text-xl font-bold">
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div
            className={cn(
              "inline-block px-3 py-1 rounded-full text-sm font-medium mt-2",
              getStatusColor(status),
            )}
          >
            {status !== "none"
              ? status.charAt(0).toUpperCase() + status.slice(1)
              : "No Status"}
          </div>
        </div>
        <div className="border rounded-md overflow-hidden">
          {hours.map((hour) => (
            <div key={hour} className="flex border-b last:border-b-0">
              <div className="w-20 p-2 border-r bg-gray-50 text-sm font-medium">
                {hour}:00
              </div>
              <div className="flex-1 p-2 min-h-[40px]">
                {/* Simplified empty content */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Attendance Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium">
              {date.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as "month" | "week" | "day")}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
            <TabsContent value="month" className="mt-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                className="rounded-md border"
                components={{
                  Day: ({
                    day,
                    displayMonth,
                    ...props
                  }: {
                    day: Date | undefined;
                    displayMonth?: Date;
                    [key: string]: any;
                  }) => (
                    <button
                      {...props}
                      className={cn(
                        props.className,
                        "h-9 w-9 p-0 font-normal relative hover:bg-accent focus:bg-accent",
                      )}
                    >
                      {renderDayContent(day)}
                    </button>
                  ),
                }}
              />
              <div className="mt-4 flex justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm">Present</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Late</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-sm">Absent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Leave</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="week">{renderWeekView()}</TabsContent>
            <TabsContent value="day">{renderDayView()}</TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarWidget;
