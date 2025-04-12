import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, X } from "lucide-react";

const formSchema = z.object({
  employeeId: z.string().min(1, { message: "Employee is required" }),
});

type FormValues = z.infer<typeof formSchema>;

import { Employee as EmployeeType } from "@/types/database.types";

interface Employee {
  id: string;
  name: string;
  position?: string;
  department?: string;
  avatar?: string;
  status: "available" | "busy" | "unavailable";
  division?: string;
  branch?: string;
}

interface ShiftAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  shiftName: string;
  shiftDate: string;
  shiftTime: string;
  branch: string;
  employees?: EmployeeType[];
}

const ShiftAssignmentDialog = (props: ShiftAssignmentDialogProps) => {
  const {
    open = true,
    onClose,
    onSubmit,
    shiftName,
    shiftDate,
    shiftTime,
    branch,
  } = props;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: "",
    },
  });

  // Use employees passed from parent component
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);

  // Set employees when props change
  useEffect(() => {
    if (props.employees && props.employees.length > 0) {
      // Transform employees to match our interface
      const transformedEmployees = props.employees.map((emp) => ({
        id: emp.id,
        name: emp.name,
        position: emp.employee_id, // Using employee_id as position for now
        department: emp.division,
        avatar: emp.avatar,
        status: "available", // Default status
        division: emp.division,
        branch: emp.branch,
      }));
      setAvailableEmployees(transformedEmployees);
    }
  }, [props.employees]);

  const filteredEmployees = availableEmployees.filter((employee) => {
    const matchesSearch = employee.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    form.setValue("employeeId", employee.id);
  };

  const handleSubmit = (data: FormValues) => {
    if (selectedEmployee) {
      // Include the selected employee information in the submission
      const submissionData = {
        ...data,
        employeeName: selectedEmployee.name,
        employeeDivision: selectedEmployee.division,
        employeeBranch: selectedEmployee.branch,
      };
      onSubmit(submissionData);
    } else {
      onSubmit(data);
    }
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "busy":
        return "bg-yellow-100 text-yellow-800";
      case "unavailable":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Employee to Shift</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <h3 className="font-medium">{shiftName}</h3>
            <div className="text-sm text-gray-500">
              {branch} • {shiftDate} • {shiftTime}
            </div>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search employees..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Select Employee</FormLabel>
                    <FormControl>
                      <div className="hidden">
                        <Input {...field} />
                      </div>
                    </FormControl>
                    <ScrollArea className="h-[200px] border rounded-md p-2">
                      <div className="space-y-2">
                        {filteredEmployees.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            No employees found
                          </div>
                        ) : (
                          filteredEmployees.map((employee) => (
                            <div
                              key={employee.id}
                              className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-50 ${selectedEmployee?.id === employee.id ? "bg-blue-50 border border-blue-200" : ""}`}
                              onClick={() => handleSelectEmployee(employee)}
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
                                  <div className="font-medium">
                                    {employee.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {employee.position} • {employee.department}
                                  </div>
                                </div>
                              </div>
                              <Badge
                                className={getStatusColor(employee.status)}
                              >
                                {employee.status}
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedEmployee && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={
                          selectedEmployee.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedEmployee.name}`
                        }
                        alt={selectedEmployee.name}
                      />
                      <AvatarFallback>
                        {selectedEmployee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{selectedEmployee.name}</div>
                      <div className="text-sm text-gray-500">
                        {selectedEmployee.position} •{" "}
                        {selectedEmployee.department}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedEmployee(null);
                      form.setValue("employeeId", "");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedEmployee}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign Employee
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftAssignmentDialog;
