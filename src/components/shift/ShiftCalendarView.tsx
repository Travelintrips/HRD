import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Building,
  Edit,
} from "lucide-react";

interface Shift {
  id: string;
  name: string;
  branch: string;
  startTime: string;
  endTime: string;
  date: string;
  capacity: number;
  assigned: number;
  status: "open" | "full" | "closed";
}

interface ShiftCalendarViewProps {
  shifts: Shift[];
  onDateSelect?: (date: Date) => void;
  onViewShiftDetails?: (shift: Shift) => void;
  onEditShift?: (shift: Shift) => void;
}

const ShiftCalendarView = ({
  shifts = [],
  onDateSelect = () => {},
  onViewShiftDetails = () => {},
  onEditShift,
}: ShiftCalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      onDateSelect(date);
    }
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  // Simple function to get shifts for a specific date
  const getShiftsForDate = (date: Date) => {
    if (!date) return [];

    // Limit the number of shifts we process to avoid memory issues
    const limitedShifts = shifts.slice(0, 50);

    return limitedShifts.filter((shift) => {
      try {
        const shiftDate = new Date(shift.date);
        return isSameDay(shiftDate, date);
      } catch (e) {
        return false;
      }
    });
  };

  // Simplified day rendering to reduce memory usage
  const renderDay = (day: Date | undefined) => {
    if (!day) return null;

    // Only check if there are any shifts, not the specific status
    // This reduces the number of operations per day cell
    const hasShifts = getShiftsForDate(day).length > 0;

    // Simplified background color logic
    const bgColor = hasShifts ? "bg-green-100" : "";

    return (
      <div
        className={cn(
          "h-9 w-9 p-0 flex items-center justify-center rounded-md relative border border-gray-300",
          bgColor,
        )}
      >
        <span className="text-base font-semibold text-black dark:text-white">
          {day.getDate()}
        </span>
        {hasShifts && (
          <div className="absolute bottom-1 flex">
            <div className="h-1 w-1 rounded-full bg-primary" />
          </div>
        )}
      </div>
    );
  };

  // Display shifts for the selected date - limit to 10 for performance
  const selectedDateShifts = getShiftsForDate(currentDate).slice(0, 10);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "full":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">{format(currentDate, "MMMM yyyy")}</div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Calendar
            mode="single"
            selected={currentDate}
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
                  className="relative w-full h-full p-0 hover:bg-accent focus:bg-accent hover:text-accent-foreground focus:text-accent-foreground"
                >
                  {renderDay(day)}
                </button>
              ),
            }}
          />
          <div className="mt-4 flex justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Open Shifts</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Full Shifts</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm">Closed Shifts</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">
            Shifts for {format(currentDate, "MMMM d, yyyy")}
          </h3>
          {selectedDateShifts.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-md">
              <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500">No shifts scheduled for this date</p>
              <Button className="mt-4" size="sm">
                Add Shift
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateShifts.map((shift) => (
                <Card
                  key={shift.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onViewShiftDetails(shift)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{shift.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Building className="h-3.5 w-3.5" />
                          <span>{shift.branch}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {formatTime(shift.startTime)} -{" "}
                            {formatTime(shift.endTime)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onEditShift) {
                                onEditShift(shift);
                              } else {
                                onViewShiftDetails(shift);
                              }
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Shift
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(shift.status)}>
                          {shift.status.charAt(0).toUpperCase() +
                            shift.status.slice(1)}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3.5 w-3.5 text-gray-500" />
                          <span>
                            {shift.assigned}/{shift.capacity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftCalendarView;
