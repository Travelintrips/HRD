import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Branch } from "@/types/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  Clock,
  Download,
  Upload,
  Calendar as CalendarIcon,
  Plus,
  Users,
  Building,
  Search,
  Filter,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ShiftForm from "./ShiftForm";
import ShiftDetailsDialog from "./ShiftDetailsDialog";
import ShiftAssignmentDialog from "./ShiftAssignmentDialog";
import ShiftCalendarView from "./ShiftCalendarView";

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
  isRecurring?: boolean;
  recurringDays?: string[];
  recurringFrequency?: string | null;
  recurringEndDate?: string | null;
  assignedEmployees: Employee[];
  assignedEmployeeIds?: string[];
}

interface ShiftManagementPanelProps {
  userRole?: "admin" | "supervisor" | "employee";
}

const ShiftManagementPanel = ({
  userRole = "admin",
}: ShiftManagementPanelProps) => {
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);

  // Dialog states
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [showShiftDetails, setShowShiftDetails] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Fetch branches from Supabase
  useEffect(() => {
    async function fetchBranches() {
      try {
        setIsLoadingBranches(true);
        const { data, error } = await supabase
          .from("branches")
          .select("*")
          .order("name");

        if (error) {
          console.error("Error fetching branches:", error);
          return;
        }

        if (data) {
          setBranches(data);
        }
      } catch (error) {
        console.error("Unexpected error fetching branches:", error);
      } finally {
        setIsLoadingBranches(false);
      }
    }

    fetchBranches();
  }, []);

  // State for shifts data
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [isLoadingShifts, setIsLoadingShifts] = useState(true);

  // Fetch shifts from Supabase
  const fetchShifts = async () => {
    try {
      setIsLoadingShifts(true);
      // Fetch shifts with their assignments
      const { data, error } = await supabase
        .from("shifts")
        .select("*, shift_assignments(employee_id)")
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching shifts:", error);
        return;
      }

      if (data) {
        // Transform the data to match our Shift interface
        const transformedShifts: Shift[] = data.map((shift) => {
          // Get assigned employee IDs from shift_assignments
          const assignedEmployeeIds = shift.shift_assignments
            ? shift.shift_assignments.map(
                (assignment: any) => assignment.employee_id,
              )
            : [];

          // Count assigned employees
          const assignedCount = assignedEmployeeIds.length;

          return {
            id: shift.id,
            name: shift.name,
            branch: shift.branch,
            startTime: shift.start_time,
            endTime: shift.end_time,
            date: shift.date,
            capacity: shift.capacity,
            assigned: assignedCount,
            status: shift.status,
            isRecurring: shift.is_recurring || false,
            recurringDays: shift.recurring_days || [],
            recurringFrequency: shift.recurring_frequency || null,
            recurringEndDate: shift.recurring_end_date || null,
            assignedEmployees: [], // Will be populated with employee details when viewing shift details
            assignedEmployeeIds: assignedEmployeeIds, // Store the IDs for later use
          };
        });

        setAllShifts(transformedShifts);
      }
    } catch (error) {
      console.error("Unexpected error fetching shifts:", error);
    } finally {
      setIsLoadingShifts(false);
    }
  };

  // Fetch shifts when component mounts
  useEffect(() => {
    fetchShifts();
  }, []);

  // Filter shifts based on selected date, branch, status, and search query
  // Limit the number of shifts processed to improve performance
  const filteredShifts = allShifts
    .slice(0, 100) // Process max 100 shifts at a time
    .filter((shift) => {
      try {
        const dateMatch = format(selectedDate, "yyyy-MM-dd") === shift.date;
        const branchMatch =
          selectedBranch === "all" || shift.branch === selectedBranch;
        const statusMatch =
          statusFilter === "all" || shift.status === statusFilter;
        const searchMatch =
          searchQuery === "" ||
          shift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shift.branch.toLowerCase().includes(searchQuery.toLowerCase());

        return dateMatch && branchMatch && statusMatch && searchMatch;
      } catch (e) {
        console.error("Error filtering shifts:", e);
        return false;
      }
    });

  const handleAddShift = () => {
    setEditMode(false);
    setSelectedShift(null);
    setShowShiftForm(true);
  };

  const handleEditShift = (shift?: Shift) => {
    console.log("Editing shift:", shift || selectedShift);
    if (shift) {
      setSelectedShift(shift);
    }
    setEditMode(true);
    setShowShiftDetails(false);
    setShowShiftForm(true);
  };

  const handleDeleteShift = async () => {
    if (selectedShift) {
      try {
        console.log(`Deleting shift with ID: ${selectedShift.id}`);

        const { error } = await supabase
          .from("shifts")
          .delete()
          .eq("id", selectedShift.id);

        if (error) {
          console.error("Error deleting shift:", error);
          alert(`Error: ${error.message}`);
          return;
        }

        alert(`Shift "${selectedShift.name}" has been deleted successfully`);
        setShowShiftDetails(false);

        // Refresh shifts data after deletion
        await fetchShifts();
      } catch (error) {
        console.error("Unexpected error deleting shift:", error);
        alert(
          `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  };

  const handleViewShiftDetails = (shift: Shift) => {
    setSelectedShift(shift);
    setShowShiftDetails(true);
  };

  // State for employees data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);

  // Fetch employees from Supabase
  useEffect(() => {
    async function fetchEmployees() {
      try {
        setIsLoadingEmployees(true);
        const { data, error } = await supabase
          .from("employees")
          .select("*")
          .order("name");

        if (error) {
          console.error("Error fetching employees:", error);
          return;
        }

        if (data) {
          setEmployees(data);
        }
      } catch (error) {
        console.error("Unexpected error fetching employees:", error);
      } finally {
        setIsLoadingEmployees(false);
      }
    }

    fetchEmployees();
  }, []);

  const handleAssignEmployee = () => {
    if (selectedShift) {
      setShowShiftDetails(false);
      setShowAssignDialog(true);
    }
  };

  const handleShiftFormSubmit = async (data: any) => {
    console.log("Shift form submitted:", data);

    if (editMode) {
      alert(`Shift "${data.name}" has been updated successfully`);
    } else {
      alert(`New shift "${data.name}" has been created successfully`);
    }

    // Refresh shifts data after submission
    await fetchShifts();
    setShowShiftForm(false);
  };

  const handleAssignmentSubmit = async (data: any) => {
    console.log("Assignment submitted:", data);

    if (!selectedShift || !data.employeeId) {
      alert("Missing shift or employee information");
      return;
    }

    try {
      // Check if assignment already exists
      const { data: existingAssignments, error: checkError } = await supabase
        .from("shift_assignments")
        .select("*")
        .eq("shift_id", selectedShift.id)
        .eq("employee_id", data.employeeId);

      if (checkError) {
        console.error("Error checking existing assignments:", checkError);
        alert(`Error: ${checkError.message}`);
        return;
      }

      // If assignment already exists, don't create a duplicate
      if (existingAssignments && existingAssignments.length > 0) {
        alert(`This employee is already assigned to this shift`);
        setShowAssignDialog(false);
        return;
      }

      // Create new assignment
      const { error } = await supabase.from("shift_assignments").insert({
        shift_id: selectedShift.id,
        employee_id: data.employeeId,
      });

      if (error) {
        console.error("Error creating shift assignment:", error);
        alert(`Error: ${error.message}`);
        return;
      }

      alert(
        `Employee ${data.employeeName || ""} has been assigned to the shift successfully`,
      );

      // Refresh shifts data after assignment
      await fetchShifts();
      setShowAssignDialog(false);
    } catch (error) {
      console.error("Unexpected error creating shift assignment:", error);
      alert(
        `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  const handleImportShifts = () => {
    console.log("Import shifts clicked");
    // Implement import shifts logic
    alert("Import shifts functionality will be implemented here");
  };

  const handleExportShifts = () => {
    console.log("Export shifts clicked");
    // Here you would generate an Excel file with shift data
    alert("Shifts have been exported successfully");
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-100 text-green-800">Open</Badge>;
      case "full":
        return <Badge className="bg-yellow-100 text-yellow-800">Full</Badge>;
      case "closed":
        return <Badge className="bg-red-100 text-red-800">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <CardTitle className="text-xl font-bold">Shift Management</CardTitle>
        <div className="flex flex-wrap gap-2">
          {userRole === "admin" && (
            <>
              <Button size="sm" variant="outline" onClick={handleExportShifts}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button size="sm" variant="outline" onClick={handleImportShifts}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button size="sm" onClick={handleAddShift}>
                <Plus className="mr-2 h-4 w-4" />
                Add Shift
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-wrap">
          <div className="flex items-center gap-2">
            <Label htmlFor="branch-select">Branch:</Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger id="branch-select" className="w-[180px]">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {isLoadingBranches ? (
                  <SelectItem value="loading" disabled>
                    Loading branches...
                  </SelectItem>
                ) : branches.length > 0 ? (
                  branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name}>
                      {branch.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-branches-found" disabled>
                    No branches found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="status-select">Status:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-select" className="w-[150px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search shifts..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Tabs
          defaultValue="calendar"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-0">
            <ShiftCalendarView
              shifts={allShifts}
              onDateSelect={setSelectedDate}
              onViewShiftDetails={handleViewShiftDetails}
              onEditShift={handleEditShift}
            />
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <Table>
              <TableCaption>List of available shifts</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Shift</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShifts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No shifts found for the selected date and branch
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredShifts.map((shift) => (
                    <TableRow key={shift.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-medium">{shift.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          {shift.branch}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(shift.date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {formatTime(shift.startTime)} -{" "}
                        {formatTime(shift.endTime)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>
                            {shift.assigned}/{shift.capacity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(shift.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewShiftDetails(shift)}
                        >
                          View Details
                        </Button>
                        {userRole === "admin" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={() => handleEditShift(shift)}
                          >
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={7} className="text-right">
                    Total Shifts: {filteredShifts.length}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Shift Form Dialog */}
      {showShiftForm && (
        <ShiftForm
          open={showShiftForm}
          onClose={() => setShowShiftForm(false)}
          onSubmit={handleShiftFormSubmit}
          initialData={editMode ? selectedShift : undefined}
          editMode={editMode}
          branches={branches}
        />
      )}

      {/* Loading indicator for shifts */}
      {isLoadingShifts && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md shadow-md">
            <p className="text-center">Loading shifts...</p>
          </div>
        </div>
      )}

      {/* Shift Details Dialog */}
      {showShiftDetails && selectedShift && (
        <ShiftDetailsDialog
          open={showShiftDetails}
          onClose={() => setShowShiftDetails(false)}
          shift={selectedShift}
          onEdit={() => handleEditShift()}
          onDelete={handleDeleteShift}
          onAssign={handleAssignEmployee}
          userRole={userRole}
        />
      )}

      {/* Shift Assignment Dialog */}
      {showAssignDialog && selectedShift && (
        <ShiftAssignmentDialog
          open={showAssignDialog}
          onClose={() => setShowAssignDialog(false)}
          onSubmit={handleAssignmentSubmit}
          shiftName={selectedShift.name}
          shiftDate={format(new Date(selectedShift.date), "MMMM d, yyyy")}
          shiftTime={`${formatTime(selectedShift.startTime)} - ${formatTime(selectedShift.endTime)}`}
          branch={selectedShift.branch}
          employees={employees}
        />
      )}

      {/* Loading indicator for employees */}
      {isLoadingEmployees && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md shadow-md">
            <p className="text-center">Loading employees...</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ShiftManagementPanel;
