import React, { useState, useEffect } from "react";
import { PlusCircle, Download, Upload, RefreshCw } from "lucide-react";
import EmployeeForm from "./EmployeeForm";
import DeleteEmployeeDialog from "./DeleteEmployeeDialog";
import TransferEmployeeDialog from "./TransferEmployeeDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmployeeFilters from "./EmployeeFilters";
import EmployeeTable from "./EmployeeTable";
import { supabase } from "@/lib/supabaseClient";
import { Employee } from "@/types/database.types";
import { useToast } from "@/components/ui/use-toast";

interface EmployeeManagementPanelProps {
  onAddEmployee?: () => void;
  onImportEmployees?: () => void;
  onExportEmployees?: () => void;
  onRefreshData?: () => void;
}

const EmployeeManagementPanel = ({
  onAddEmployee = () => {},
  onImportEmployees = () => {},
  onExportEmployees = () => {},
  onRefreshData = () => {},
}: EmployeeManagementPanelProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    branch: "",
    branchId: "",
    cityId: "",
    workAreaId: "",
    workPlaceId: "",
    division: "",
    status: "",
    search: "",
  });

  // Dialog states
  const [showAddEditForm, setShowAddEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // State for employees data
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees from Supabase
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      // First fetch employees with branch information using nested relations
      const { data: employeeData, error: employeeError } = await supabase.from(
        "employees",
      ).select(`
          *,
          branches:branch_id (id, name, work_place_id, 
            work_places:work_place_id (id, name, work_area_id, 
              work_areas:work_area_id (id, name, city_id, 
                cities:city_id (id, name)
              )
            )
          )
        `);

      if (employeeError) {
        throw employeeError;
      }

      // Then fetch attendance data for today to get attendance status
      const today = new Date().toISOString().split("T")[0];
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("*")
        .eq("date", today);

      if (attendanceError) {
        console.warn("Error fetching attendance data:", attendanceError);
        // Continue without attendance data
      }

      // Create a map of employee_id to attendance status
      const attendanceMap = new Map();
      if (attendanceData) {
        attendanceData.forEach((att) => {
          attendanceMap.set(att.employee_id, att.status);
        });
      }

      // Transform data to match the expected format
      const formattedData = employeeData.map((emp) => {
        // Extract nested data
        const branch = emp.branches || {};
        const workPlace = branch.work_places || {};
        const workArea = workPlace.work_areas || {};
        const city = workArea.cities || {};

        return {
          id: emp.id,
          name: emp.name,
          employeeId: emp.employee_id,
          branchId: emp.branch_id,
          branch: branch.name || emp.branch, // Fallback to the old branch field
          workPlaceId: workPlace.id,
          workPlaceName: workPlace.name,
          workAreaId: workArea.id,
          workAreaName: workArea.name,
          cityId: city.id,
          cityName: city.name,
          division: emp.division,
          status: emp.status as "permanent" | "freelance",
          // Use attendance status from attendance data if available, otherwise default to "present"
          attendanceStatus: (attendanceMap.get(emp.id) || "present") as
            | "present"
            | "absent"
            | "late"
            | "leave",
          avatar:
            emp.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`,
        };
      });

      setAllEmployees(formattedData);
    } catch (err: any) {
      console.error("Error fetching employees:", err);
      setError(err.message);
      toast({
        title: "Error fetching employees",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();

    // Set up real-time subscription for both employees and attendance tables
    const employeesSubscription = supabase
      .channel("employees-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "employees",
        },
        () => {
          fetchEmployees();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendance",
        },
        () => {
          fetchEmployees();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(employeesSubscription);
    };
  }, []);

  const permanentEmployees = allEmployees.filter(
    (emp) => emp.status === "permanent",
  );
  const freelanceEmployees = allEmployees.filter(
    (emp) => emp.status === "freelance",
  );

  const handleFilterChange = (newFilters: {
    branch: string;
    branchId: string;
    cityId: string;
    workAreaId: string;
    workPlaceId: string;
    division: string;
    status: string;
    search: string;
  }) => {
    setFilters(newFilters);
  };

  const handleViewEmployee = (id: string) => {
    console.log(`View employee with ID: ${id}`);
    // Implement view employee logic
  };

  const handleEditEmployee = (id: string, employee: any) => {
    console.log(`Edit employee with ID: ${id}`);
    setSelectedEmployee(employee);
    setIsEditing(true);
    setShowAddEditForm(true);
  };

  const handleDeleteEmployee = (id: string, employee: any) => {
    console.log(`Delete employee with ID: ${id}`);
    setSelectedEmployee(employee);
    setShowDeleteDialog(true);
  };

  const handleTransferEmployee = (id: string, employee: any) => {
    console.log(`Transfer employee with ID: ${id}`);
    setSelectedEmployee(employee);
    setShowTransferDialog(true);
  };

  const handleAddNewEmployee = () => {
    setSelectedEmployee(null);
    setIsEditing(false);
    setShowAddEditForm(true);
  };

  const handleEmployeeFormSubmit = async (data: any) => {
    try {
      // The form component now handles all the validation and database operations
      // This function just needs to handle the UI updates after submission

      // Close the form and refresh data
      setShowAddEditForm(false);
      fetchEmployees();

      toast({
        title: "Success",
        description: isEditing
          ? "Employee updated successfully"
          : "Employee added successfully",
      });
    } catch (err: any) {
      console.error("Error saving employee:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedEmployee) return;

      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", selectedEmployee.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });

      setShowDeleteDialog(false);
      fetchEmployees();
    } catch (err: any) {
      console.error("Error deleting employee:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleTransferSubmit = async (data: { branch: string }) => {
    try {
      if (!selectedEmployee) return;

      // Find the branch ID for the selected branch name
      const { data: branchData, error: branchError } = await supabase
        .from("branches")
        .select("id")
        .eq("name", data.branch)
        .single();

      if (branchError) throw branchError;

      const { error } = await supabase
        .from("employees")
        .update({
          branch: data.branch,
          branch_id: branchData?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedEmployee.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Employee transferred to ${data.branch} successfully`,
      });

      setShowTransferDialog(false);
      fetchEmployees();
    } catch (err: any) {
      console.error("Error transferring employee:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleSelectEmployee = (id: string, selected: boolean) => {
    console.log(`Employee ${id} selected: ${selected}`);
    // Implement select employee logic
  };

  const handleSelectAll = (selected: boolean) => {
    console.log(`Select all employees: ${selected}`);
    // Implement select all logic
  };

  // Filter employees based on current filters
  const filterEmployees = (employees: typeof allEmployees) => {
    return employees.filter((emp) => {
      // Search filter
      const matchesSearch =
        !filters.search ||
        emp.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(filters.search.toLowerCase());

      // Branch filter - either by ID or name
      const matchesBranch =
        !filters.branchId || emp.branchId === filters.branchId;

      // Work Place filter
      const matchesWorkPlace =
        !filters.workPlaceId || emp.workPlaceId === filters.workPlaceId;

      // Work Area filter
      const matchesWorkArea =
        !filters.workAreaId || emp.workAreaId === filters.workAreaId;

      // City filter
      const matchesCity = !filters.cityId || emp.cityId === filters.cityId;

      // Division filter
      const matchesDivision =
        !filters.division ||
        filters.division === "all" ||
        emp.division === filters.division;

      // Status filter
      const matchesStatus =
        !filters.status ||
        filters.status === "all" ||
        emp.status === filters.status;

      return (
        matchesSearch &&
        matchesBranch &&
        matchesWorkPlace &&
        matchesWorkArea &&
        matchesCity &&
        matchesDivision &&
        matchesStatus
      );
    });
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <CardTitle className="text-xl font-bold">Employee Management</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={fetchEmployees} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Loading..." : "Refresh"}
          </Button>
          <Button size="sm" variant="outline" onClick={onExportEmployees}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" variant="outline" onClick={onImportEmployees}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setSelectedEmployee(null);
              setIsEditing(false);
              setShowAddEditForm(true);
              onAddEmployee();
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <EmployeeFilters onFilterChange={handleFilterChange} />

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">
              All Employees ({allEmployees.length})
            </TabsTrigger>
            <TabsTrigger value="permanent">
              Permanent ({permanentEmployees.length})
            </TabsTrigger>
            <TabsTrigger value="freelance">
              Freelance ({freelanceEmployees.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : (
              <EmployeeTable
                employees={filterEmployees(allEmployees)}
                onViewEmployee={handleViewEmployee}
                onEditEmployee={handleEditEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onTransferEmployee={handleTransferEmployee}
                onSelectEmployee={handleSelectEmployee}
                onSelectAll={handleSelectAll}
              />
            )}
          </TabsContent>

          <TabsContent value="permanent" className="mt-0">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : (
              <EmployeeTable
                employees={filterEmployees(permanentEmployees)}
                onViewEmployee={handleViewEmployee}
                onEditEmployee={handleEditEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onTransferEmployee={handleTransferEmployee}
                onSelectEmployee={handleSelectEmployee}
                onSelectAll={handleSelectAll}
              />
            )}
          </TabsContent>

          <TabsContent value="freelance" className="mt-0">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : (
              <EmployeeTable
                employees={filterEmployees(freelanceEmployees)}
                onViewEmployee={handleViewEmployee}
                onEditEmployee={handleEditEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onTransferEmployee={handleTransferEmployee}
                onSelectEmployee={handleSelectEmployee}
                onSelectAll={handleSelectAll}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Employee Form Dialog */}
      {showAddEditForm && (
        <EmployeeForm
          open={showAddEditForm}
          onClose={() => setShowAddEditForm(false)}
          onSubmit={handleEmployeeFormSubmit}
          employee={selectedEmployee}
          title={isEditing ? "Edit Employee" : "Add Employee"}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedEmployee && (
        <DeleteEmployeeDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteConfirm}
          employeeName={selectedEmployee.name}
        />
      )}

      {/* Transfer Employee Dialog */}
      {showTransferDialog && selectedEmployee && (
        <TransferEmployeeDialog
          open={showTransferDialog}
          onClose={() => setShowTransferDialog(false)}
          onSubmit={handleTransferSubmit}
          employeeName={selectedEmployee.name}
          currentBranch={selectedEmployee.branch}
        />
      )}
    </Card>
  );
};

export default EmployeeManagementPanel;
