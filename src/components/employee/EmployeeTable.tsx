import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  branch: string;
  branchId?: string;
  cityName?: string;
  workAreaName?: string;
  workPlaceName?: string;
  division: string;
  status: "permanent" | "freelance";
  attendanceStatus: "present" | "absent" | "late" | "leave";
  avatar: string;
}

interface EmployeeTableProps {
  employees?: Employee[];
  onViewEmployee?: (id: string) => void;
  onEditEmployee?: (id: string, employee: Employee) => void;
  onDeleteEmployee?: (id: string, employee: Employee) => void;
  onTransferEmployee?: (id: string, employee: Employee) => void;
  onSelectEmployee?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
}

const EmployeeTable = ({
  employees = [
    {
      id: "1",
      name: "John Doe",
      employeeId: "EMP001",
      branch: "Headquarters",
      division: "Engineering",
      status: "permanent",
      attendanceStatus: "present",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    },
    {
      id: "2",
      name: "Jane Smith",
      employeeId: "EMP002",
      branch: "North Branch",
      division: "Marketing",
      status: "permanent",
      attendanceStatus: "late",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    },
    {
      id: "3",
      name: "Robert Johnson",
      employeeId: "EMP003",
      branch: "South Branch",
      division: "Finance",
      status: "freelance",
      attendanceStatus: "absent",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    },
    {
      id: "4",
      name: "Emily Davis",
      employeeId: "EMP004",
      branch: "East Branch",
      division: "Human Resources",
      status: "permanent",
      attendanceStatus: "leave",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    },
    {
      id: "5",
      name: "Michael Wilson",
      employeeId: "EMP005",
      branch: "West Branch",
      division: "Operations",
      status: "freelance",
      attendanceStatus: "present",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    },
  ],
  onViewEmployee = () => {},
  onEditEmployee = () => {},
  onDeleteEmployee = () => {},
  onTransferEmployee = () => {},
  onSelectEmployee = () => {},
  onSelectAll = () => {},
}: EmployeeTableProps) => {
  const [sortField, setSortField] = useState<keyof Employee | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedEmployees(checked ? employees.map((emp) => emp.id) : []);
    onSelectAll(checked);
  };

  const handleSelectEmployee = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees((prev) => [...prev, id]);
    } else {
      setSelectedEmployees((prev) => prev.filter((empId) => empId !== id));
      setSelectAll(false);
    }
    onSelectEmployee(id, checked);
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "leave":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEmploymentStatusColor = (status: string) => {
    switch (status) {
      case "permanent":
        return "bg-purple-100 text-purple-800";
      case "freelance":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const SortIcon = ({ field }: { field: keyof Employee }) => {
    if (sortField !== field)
      return <ChevronDown className="ml-1 h-4 w-4 opacity-50" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <div className="w-full bg-white rounded-md shadow">
      <Table>
        <TableCaption>
          List of employees and their attendance status
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                aria-label="Select all employees"
              />
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center">
                Employee
                <SortIcon field="name" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("employeeId")}
            >
              <div className="flex items-center">
                ID
                <SortIcon field="employeeId" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("branch")}
            >
              <div className="flex items-center">
                Branch
                <SortIcon field="branch" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("division")}
            >
              <div className="flex items-center">
                Division
                <SortIcon field="division" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center">
                Status
                <SortIcon field="status" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("attendanceStatus")}
            >
              <div className="flex items-center">
                Attendance
                <SortIcon field="attendanceStatus" />
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEmployees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6">
                No employees found
              </TableCell>
            </TableRow>
          ) : (
            sortedEmployees.map((employee) => (
              <TableRow key={employee.id} className="hover:bg-gray-50">
                <TableCell>
                  <Checkbox
                    checked={selectedEmployees.includes(employee.id)}
                    onCheckedChange={(checked) =>
                      handleSelectEmployee(employee.id, checked === true)
                    }
                    aria-label={`Select ${employee.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <img
                        src={employee.avatar}
                        alt={employee.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="font-medium">{employee.name}</div>
                  </div>
                </TableCell>
                <TableCell>{employee.employeeId}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{employee.branch}</span>
                    {employee.cityName && (
                      <span className="text-xs text-gray-500">
                        {employee.cityName}
                        {employee.workAreaName && ` > ${employee.workAreaName}`}
                        {employee.workPlaceName &&
                          ` > ${employee.workPlaceName}`}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{employee.division}</TableCell>
                <TableCell>
                  <Badge
                    className={cn(getEmploymentStatusColor(employee.status))}
                  >
                    {employee.status.charAt(0).toUpperCase() +
                      employee.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      getAttendanceStatusColor(employee.attendanceStatus),
                    )}
                  >
                    {employee.attendanceStatus.charAt(0).toUpperCase() +
                      employee.attendanceStatus.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onViewEmployee(employee.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEditEmployee(employee.id, employee)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          onTransferEmployee(employee.id, employee)
                        }
                      >
                        <Building className="mr-2 h-4 w-4" />
                        Transfer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteEmployee(employee.id, employee)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={8} className="text-right">
              Total Employees: {employees.length}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default EmployeeTable;
