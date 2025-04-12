import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeManagementPanel from "@/components/employee/EmployeeManagementPanel";

const EmployeesPage = () => {
  const handleAddEmployee = () => {
    console.log("Add employee clicked");
    // This function is called when the Add Employee button is clicked
    // The actual form display is handled in the EmployeeManagementPanel component
  };

  const handleImportEmployees = () => {
    console.log("Import employees clicked");
    // Implement import employees logic
  };

  const handleExportEmployees = () => {
    console.log("Export employees clicked");
    // Implement export employees logic
  };

  const handleRefreshData = () => {
    console.log("Refresh data clicked");
    // Implement refresh data logic
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Employee Management
          </h1>

          <EmployeeManagementPanel
            onAddEmployee={handleAddEmployee}
            onImportEmployees={handleImportEmployees}
            onExportEmployees={handleExportEmployees}
            onRefreshData={handleRefreshData}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeesPage;
