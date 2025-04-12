import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Clock, Users, Building, Edit, Trash, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

interface Employee {
  id: string;
  name: string;
  position: string;
  avatar?: string;
}

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
  assignedEmployees: Employee[];
  assignedEmployeeIds?: string[];
}

interface ShiftDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  shift: Shift;
  onEdit?: () => void;
  onDelete?: () => void;
  onAssign?: () => void;
  userRole?: "admin" | "supervisor" | "employee";
}

const ShiftDetailsDialog = ({
  open = true,
  onClose,
  shift,
  onEdit = () => {},
  onDelete = () => {},
  onAssign = () => {},
  userRole = "admin",
}: ShiftDetailsDialogProps) => {
  const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch assigned employees when the dialog opens and shift has assignedEmployeeIds
  useEffect(() => {
    const fetchAssignedEmployees = async () => {
      if (
        !shift.assignedEmployeeIds ||
        shift.assignedEmployeeIds.length === 0
      ) {
        setAssignedEmployees([]);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("employees")
          .select("*")
          .in("id", shift.assignedEmployeeIds);

        if (error) {
          console.error("Error fetching assigned employees:", error);
          return;
        }

        if (data) {
          // Transform the data to match our Employee interface
          const transformedEmployees: Employee[] = data.map((employee) => ({
            id: employee.id,
            name: employee.name,
            position: employee.division || "Staff", // Use division as position or default to "Staff"
            avatar: employee.avatar,
          }));

          setAssignedEmployees(transformedEmployees);
        }
      } catch (error) {
        console.error("Unexpected error fetching assigned employees:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchAssignedEmployees();
    }
  }, [open, shift.assignedEmployeeIds]);
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Shift Details</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm text-gray-500">Shift Name</Label>
              <div className="font-medium">{shift.name}</div>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Branch</Label>
              <div className="font-medium flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                {shift.branch}
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Date</Label>
              <div className="font-medium">
                {format(new Date(shift.date), "MMMM d, yyyy")}
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Time</Label>
              <div className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Capacity</Label>
              <div className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                {shift.assigned}/{shift.capacity}
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Status</Label>
              <div>
                <Badge className={cn(getStatusColor(shift.status))}>
                  {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <Label className="text-sm text-gray-500 mb-2 block">
              Assigned Employees ({assignedEmployees.length}/{shift.capacity})
            </Label>
            {isLoading ? (
              <div className="text-center p-6 border border-dashed rounded-md">
                <p className="text-gray-500">Loading assigned employees...</p>
              </div>
            ) : assignedEmployees.length === 0 ? (
              <div className="text-center p-6 border border-dashed rounded-md">
                <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">No employees assigned yet</p>
                {(userRole === "admin" || userRole === "supervisor") && (
                  <Button
                    onClick={onAssign}
                    size="sm"
                    className="mt-4"
                    disabled={shift.status === "closed"}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Employee
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {assignedEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={
                            employee.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`
                          }
                          alt={employee.name}
                        />
                        <AvatarFallback>
                          {employee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-500">
                          {employee.position}
                        </div>
                      </div>
                    </div>
                    {(userRole === "admin" || userRole === "supervisor") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={async () => {
                          try {
                            // Delete the assignment from the database
                            const { error } = await supabase
                              .from("shift_assignments")
                              .delete()
                              .eq("shift_id", shift.id)
                              .eq("employee_id", employee.id);

                            if (error) {
                              console.error(
                                "Error removing assignment:",
                                error,
                              );
                              alert(`Error: ${error.message}`);
                              return;
                            }

                            // Remove the employee from the local state
                            setAssignedEmployees((prev) =>
                              prev.filter((emp) => emp.id !== employee.id),
                            );

                            // Update the shift's assignedEmployeeIds
                            if (shift.assignedEmployeeIds) {
                              const updatedIds =
                                shift.assignedEmployeeIds.filter(
                                  (id) => id !== employee.id,
                                );
                              shift.assignedEmployeeIds = updatedIds;
                              shift.assigned = updatedIds.length;
                            }

                            alert("Employee unassigned successfully");
                          } catch (err) {
                            console.error("Unexpected error:", err);
                            alert(
                              `An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`,
                            );
                          }
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {(userRole === "admin" || userRole === "supervisor") &&
                  assignedEmployees.length < shift.capacity && (
                    <Button
                      onClick={onAssign}
                      variant="outline"
                      className="w-full mt-2"
                      disabled={shift.status === "closed"}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Assign More Employees
                    </Button>
                  )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          {(userRole === "admin" || userRole === "supervisor") && (
            <div className="flex items-center gap-2 mr-auto">
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={onDelete}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftDetailsDialog;
