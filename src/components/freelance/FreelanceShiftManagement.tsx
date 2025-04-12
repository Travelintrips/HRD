import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Clock,
  Download,
  Upload,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Building,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  assignedFreelancers: string[];
}

interface FreelanceShiftManagementProps {
  userRole?: "admin" | "supervisor" | "freelancer";
  onAddShift?: () => void;
  onImportShifts?: () => void;
  onExportShifts?: () => void;
  onTakeShift?: (shiftId: string) => void;
  onCancelShift?: (shiftId: string) => void;
  onAssignShift?: (shiftId: string, freelancerId: string) => void;
}

const FreelanceShiftManagement = ({
  userRole = "admin",
  onAddShift = () => {},
  onImportShifts = () => {},
  onExportShifts = () => {},
  onTakeShift = () => {},
  onCancelShift = () => {},
  onAssignShift = () => {},
}: FreelanceShiftManagementProps) => {
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // Mock data for shifts
  const allShifts: Shift[] = [
    {
      id: "1",
      name: "Morning Shift",
      branch: "Headquarters",
      startTime: "08:00",
      endTime: "12:00",
      date: "2023-12-15",
      capacity: 5,
      assigned: 3,
      status: "open",
      assignedFreelancers: ["John Doe", "Jane Smith", "Robert Johnson"],
    },
    {
      id: "2",
      name: "Afternoon Shift",
      branch: "Headquarters",
      startTime: "13:00",
      endTime: "17:00",
      date: "2023-12-15",
      capacity: 4,
      assigned: 4,
      status: "full",
      assignedFreelancers: [
        "Emily Davis",
        "Michael Wilson",
        "Sarah Brown",
        "David Miller",
      ],
    },
    {
      id: "3",
      name: "Morning Shift",
      branch: "North Branch",
      startTime: "08:00",
      endTime: "12:00",
      date: "2023-12-15",
      capacity: 3,
      assigned: 2,
      status: "open",
      assignedFreelancers: ["Alex Johnson", "Lisa Wang"],
    },
    {
      id: "4",
      name: "Evening Shift",
      branch: "South Branch",
      startTime: "18:00",
      endTime: "22:00",
      date: "2023-12-15",
      capacity: 2,
      assigned: 0,
      status: "open",
      assignedFreelancers: [],
    },
    {
      id: "5",
      name: "Morning Shift",
      branch: "Headquarters",
      startTime: "08:00",
      endTime: "12:00",
      date: "2023-12-16",
      capacity: 5,
      assigned: 0,
      status: "open",
      assignedFreelancers: [],
    },
  ];

  // Filter shifts based on selected date and branch
  const filteredShifts = allShifts.filter((shift) => {
    const dateMatch = selectedDate
      ? shift.date === format(selectedDate, "yyyy-MM-dd")
      : true;
    const branchMatch =
      selectedBranch === "all" || shift.branch === selectedBranch;
    return dateMatch && branchMatch;
  });

  const availableShifts = filteredShifts.filter(
    (shift) => shift.status === "open",
  );

  const fullShifts = filteredShifts.filter((shift) => shift.status === "full");

  const handleViewShiftDetails = (shift: Shift) => {
    setSelectedShift(shift);
    setShiftDialogOpen(true);
  };

  const handleOpenAssignDialog = (shift: Shift) => {
    setSelectedShift(shift);
    setAssignDialogOpen(true);
  };

  const handleTakeShift = (shiftId: string) => {
    console.log(`Taking shift with ID: ${shiftId}`);
    // Here you would save the shift selection to the database
    // Example API call: await api.freelance.takeShift(shiftId, userId);

    // Show success message to user
    alert(`Berhasil mengambil shift dengan ID: ${shiftId}`);

    onTakeShift(shiftId);
    setShiftDialogOpen(false);
  };

  const handleCancelShift = (shiftId: string) => {
    console.log(`Cancelling shift with ID: ${shiftId}`);
    // Here you would remove the shift selection from the database
    // Example API call: await api.freelance.cancelShift(shiftId, userId);

    // Show success message to user
    alert(`Berhasil membatalkan shift dengan ID: ${shiftId}`);

    onCancelShift(shiftId);
    setShiftDialogOpen(false);
  };

  const handleAssignShift = (freelancerId: string) => {
    if (selectedShift) {
      console.log(
        `Assigning shift ID: ${selectedShift.id} to freelancer ID: ${freelancerId}`,
      );
      // Here you would save the shift assignment to the database
      // Example API call: await api.admin.assignShift(selectedShift.id, freelancerId);

      // Show success message to admin
      alert(
        `Berhasil menetapkan shift kepada freelancer dengan ID: ${freelancerId}`,
      );

      onAssignShift(selectedShift.id, freelancerId);
      setAssignDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" /> Open
          </Badge>
        );
      case "full":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="mr-1 h-3 w-3" /> Full
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" /> Closed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Mock data for freelancers (for admin assignment)
  const availableFreelancers = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
    { id: "3", name: "Robert Johnson" },
    { id: "4", name: "Emily Davis" },
    { id: "5", name: "Michael Wilson" },
    { id: "6", name: "Sarah Brown" },
    { id: "7", name: "David Miller" },
    { id: "8", name: "Lisa Wang" },
    { id: "9", name: "Alex Johnson" },
  ];

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <CardTitle className="text-xl font-bold">
          Freelance Shift Management
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          {userRole === "admin" && (
            <>
              <Button size="sm" variant="outline" onClick={onExportShifts}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button size="sm" variant="outline" onClick={onImportShifts}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button size="sm" onClick={onAddShift}>
                <Clock className="mr-2 h-4 w-4" />
                Add Shift
              </Button>
            </>
          )}
          {userRole === "freelancer" && (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"
            >
              <Clock className="mr-2 h-4 w-4" />
              Available Shifts: {availableShifts.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center gap-2">
            <Label htmlFor="branch-select">Branch:</Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger id="branch-select" className="w-[180px]">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="Headquarters">Headquarters</SelectItem>
                <SelectItem value="North Branch">North Branch</SelectItem>
                <SelectItem value="South Branch">South Branch</SelectItem>
                <SelectItem value="East Branch">East Branch</SelectItem>
                <SelectItem value="West Branch">West Branch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="date-select">Date:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[180px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
            <div className="text-center p-8 border border-dashed rounded-md">
              <h3 className="text-lg font-medium mb-2">Calendar View</h3>
              <p className="text-gray-500 mb-4">
                Drag and drop interface for shift management
              </p>
              <p className="text-sm text-gray-400">
                Calendar view will be displayed here
              </p>
            </div>
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
                        {userRole === "admin" && shift.status === "open" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={() => handleOpenAssignDialog(shift)}
                          >
                            Assign
                          </Button>
                        )}
                        {userRole === "freelancer" &&
                          shift.status === "open" && (
                            <Button
                              size="sm"
                              className="ml-2"
                              onClick={() => handleTakeShift(shift.id)}
                            >
                              Take Shift
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

      {/* Shift Details Dialog */}
      <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Shift Details</DialogTitle>
          </DialogHeader>
          {selectedShift && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-sm text-gray-500">Shift</Label>
                  <div className="font-medium">{selectedShift.name}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Branch</Label>
                  <div className="font-medium">{selectedShift.branch}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Date</Label>
                  <div className="font-medium">
                    {format(new Date(selectedShift.date), "MMMM d, yyyy")}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Time</Label>
                  <div className="font-medium">
                    {formatTime(selectedShift.startTime)} -{" "}
                    {formatTime(selectedShift.endTime)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Capacity</Label>
                  <div className="font-medium">
                    {selectedShift.assigned}/{selectedShift.capacity}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Status</Label>
                  <div>{getStatusBadge(selectedShift.status)}</div>
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-sm text-gray-500 mb-2 block">
                  Assigned Freelancers
                </Label>
                {selectedShift.assignedFreelancers.length === 0 ? (
                  <div className="text-gray-500 italic">
                    No freelancers assigned yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedShift.assignedFreelancers.map((freelancer, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                      >
                        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                          {freelancer.charAt(0)}
                        </div>
                        <span>{freelancer}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {userRole === "freelancer" && selectedShift.status === "open" && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => handleTakeShift(selectedShift.id)}>
                    Take Shift
                  </Button>
                </div>
              )}

              {userRole === "freelancer" &&
                selectedShift.assignedFreelancers.includes("John Doe") && (
                  <div className="mt-6 flex justify-end">
                    <Button
                      variant="destructive"
                      onClick={() => handleCancelShift(selectedShift.id)}
                    >
                      Cancel Shift
                    </Button>
                  </div>
                )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShiftDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Freelancer Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Freelancer to Shift</DialogTitle>
          </DialogHeader>
          {selectedShift && (
            <div className="py-4">
              <div className="mb-4">
                <Label className="text-sm text-gray-500 mb-1 block">
                  Shift Details
                </Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="font-medium">{selectedShift.name}</div>
                  <div className="text-sm text-gray-500">
                    {selectedShift.branch} •{" "}
                    {format(new Date(selectedShift.date), "MMM d, yyyy")} •{" "}
                    {formatTime(selectedShift.startTime)} -{" "}
                    {formatTime(selectedShift.endTime)}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <Label htmlFor="freelancer-search" className="mb-1 block">
                  Search Freelancer
                </Label>
                <Input
                  id="freelancer-search"
                  placeholder="Type freelancer name..."
                />
              </div>

              <div className="max-h-[200px] overflow-y-auto border rounded-md">
                {availableFreelancers
                  .filter(
                    (f) =>
                      !selectedShift.assignedFreelancers.includes(f.name) &&
                      selectedShift.assigned < selectedShift.capacity,
                  )
                  .map((freelancer) => (
                    <div
                      key={freelancer.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                          {freelancer.name.charAt(0)}
                        </div>
                        <span>{freelancer.name}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAssignShift(freelancer.id)}
                      >
                        Assign
                      </Button>
                    </div>
                  ))}
                {availableFreelancers.filter(
                  (f) =>
                    !selectedShift.assignedFreelancers.includes(f.name) &&
                    selectedShift.assigned < selectedShift.capacity,
                ).length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No available freelancers to assign or shift is full
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FreelanceShiftManagement;
