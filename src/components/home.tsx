import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "./layout/DashboardLayout";
import AttendanceOverview from "./dashboard/AttendanceOverview";
import CalendarWidgetUltimate from "./dashboard/CalendarWidgetUltimate";
import EmployeeManagementPanel from "./employee/EmployeeManagementPanel";
import CheckInOutWidget from "./attendance/CheckInOutWidget";

const Home = () => {
  const handleDateSelect = (date: Date) => {
    console.log("Selected date:", date);
    // Implement date selection logic
  };

  const handleAddEmployee = () => {
    console.log("Add employee clicked");
    // Implement add employee logic
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

  const handleCheckIn = () => {
    console.log("Check in clicked");
    // Implement check in logic
  };

  const handleCheckOut = () => {
    console.log("Check out clicked");
    // Implement check out logic
  };

  const handleTakeSelfie = () => {
    console.log("Take selfie clicked");
    // Implement take selfie logic
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">
            HRD Attendance Dashboard
          </h1>

          {/* Attendance Overview Section */}
          <AttendanceOverview />

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Calendar Widget */}
            <div className="lg:col-span-2">
              <CalendarWidgetUltimate onDateSelect={handleDateSelect} />
            </div>

            {/* Right Column - Check In/Out Widget */}
            <div className="flex justify-center lg:justify-start">
              <CheckInOutWidget
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onTakeSelfie={handleTakeSelfie}
              />
            </div>
          </div>

          {/* Employee Management Section */}
          <div className="mt-6">
            <EmployeeManagementPanel
              onAddEmployee={handleAddEmployee}
              onImportEmployees={handleImportEmployees}
              onExportEmployees={handleExportEmployees}
              onRefreshData={handleRefreshData}
            />
          </div>

          {/* Quick Access Tabs */}
          <div className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
                <Tabs defaultValue="shifts" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="shifts">Shift Management</TabsTrigger>
                    <TabsTrigger value="leave">Leave Management</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                  </TabsList>
                  <TabsContent value="shifts" className="p-4">
                    <div className="text-center p-8 border border-dashed rounded-md">
                      <h3 className="text-lg font-medium mb-2">
                        Shift Management
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Manage employee shifts with drag-and-drop functionality
                      </p>
                      <p className="text-sm text-gray-400">
                        Shift management module will be displayed here
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="leave" className="p-4">
                    <div className="text-center p-8 border border-dashed rounded-md">
                      <h3 className="text-lg font-medium mb-2">
                        Leave Management
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Review and approve employee leave requests
                      </p>
                      <p className="text-sm text-gray-400">
                        Leave management module will be displayed here
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="reports" className="p-4">
                    <div className="text-center p-8 border border-dashed rounded-md">
                      <h3 className="text-lg font-medium mb-2">Reports</h3>
                      <p className="text-gray-500 mb-4">
                        Generate and export attendance and leave reports
                      </p>
                      <p className="text-sm text-gray-400">
                        Reports module will be displayed here
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;
