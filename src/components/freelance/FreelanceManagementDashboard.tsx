import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import DashboardLayout from "../layout/DashboardLayout";
import FreelanceProjectManagement from "./FreelanceProjectManagement";
import FreelancePaymentSystem from "./FreelancePaymentSystem";
import FreelanceRatingSystem from "./FreelanceRatingSystem";
import FreelanceReportingSystem from "./FreelanceReportingSystem";
import FreelanceNotificationSystem from "./FreelanceNotificationSystem";
import FreelanceShiftManagement from "./FreelanceShiftManagement";

interface FreelanceManagementDashboardProps {
  userRole?: "admin" | "supervisor" | "freelancer";
}

const FreelanceManagementDashboard = ({
  userRole = "admin",
}: FreelanceManagementDashboardProps) => {
  const [activeTab, setActiveTab] = useState("projects");

  const handleAddProject = () => {
    console.log("Add project clicked");
    // Implement add project logic
  };

  const handleImportProjects = () => {
    console.log("Import projects clicked");
    // Implement import projects logic
  };

  const handleExportProjects = () => {
    console.log("Export projects clicked");
    // Implement export projects logic
  };

  const handleAddShift = () => {
    console.log("Add shift clicked");
    // Implement add shift logic
  };

  const handleImportShifts = () => {
    console.log("Import shifts clicked");
    // Implement import shifts logic
  };

  const handleExportShifts = () => {
    console.log("Export shifts clicked");
    // Here you would generate an Excel file with shift data
    // Example: const excelData = generateExcelFile(shiftsData);

    // For demonstration, we'll show an alert
    alert("Jadwal shift berhasil diexport dalam format Excel");

    // In a real implementation, you would trigger a file download
    // Example: downloadFile(excelData, 'jadwal_shift.xlsx');
  };

  const handleTakeShift = (shiftId: string) => {
    console.log(`Take shift clicked for shift ID: ${shiftId}`);
    // Implement take shift logic
  };

  const handleCancelShift = (shiftId: string) => {
    console.log(`Cancel shift clicked for shift ID: ${shiftId}`);
    // Implement cancel shift logic
  };

  const handleAssignShift = (shiftId: string, freelancerId: string) => {
    console.log(
      `Assign shift clicked for shift ID: ${shiftId}, freelancer ID: ${freelancerId}`,
    );
    // Implement assign shift logic
  };

  const handleApprovePayment = (id: string) => {
    console.log(`Approve payment clicked for ID: ${id}`);
    // Implement approve payment logic
  };

  const handleRejectPayment = (id: string) => {
    console.log(`Reject payment clicked for ID: ${id}`);
    // Implement reject payment logic
  };

  const handleViewPaymentDetails = (id: string) => {
    console.log(`View payment details clicked for ID: ${id}`);
    // Implement view payment details logic
  };

  const handleExportPayments = () => {
    console.log("Export payments clicked");
    // Implement export payments logic
  };

  const handleExportRatings = () => {
    console.log("Export ratings clicked");
    // Implement export ratings logic
  };

  const handleViewFreelancerDetails = (id: string) => {
    console.log(`View freelancer details clicked for ID: ${id}`);
    // Implement view freelancer details logic
  };

  const handleGenerateReport = (filters: any) => {
    console.log("Generate report clicked with filters:", filters);
    // Implement generate report logic
  };

  const handleExportReport = (format: "pdf" | "excel") => {
    console.log(`Export report clicked in ${format} format`);
    // Implement export report logic
  };

  const handleMarkAsRead = (id: string) => {
    console.log(`Mark notification as read clicked for ID: ${id}`);
    // Implement mark as read logic
  };

  const handleMarkAllAsRead = () => {
    console.log("Mark all notifications as read clicked");
    // Implement mark all as read logic
  };

  const handleDeleteNotification = (id: string) => {
    console.log(`Delete notification clicked for ID: ${id}`);
    // Implement delete notification logic
  };

  const handleClearAllNotifications = () => {
    console.log("Clear all notifications clicked");
    // Implement clear all notifications logic
  };

  const handleUpdateNotificationSettings = (settings: any) => {
    console.log(
      "Update notification settings clicked with settings:",
      settings,
    );
    // Implement update notification settings logic
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Freelance Management Dashboard
          </h1>

          {/* Notification System */}
          <FreelanceNotificationSystem
            userRole={userRole}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDeleteNotification={handleDeleteNotification}
            onClearAllNotifications={handleClearAllNotifications}
            onUpdateNotificationSettings={handleUpdateNotificationSettings}
          />

          {/* Main Tabs */}
          <Card>
            <CardContent className="p-0">
              <Tabs
                defaultValue="projects"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto">
                  <TabsTrigger
                    value="projects"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-4"
                  >
                    Project Management
                  </TabsTrigger>
                  <TabsTrigger
                    value="shifts"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-4"
                  >
                    Shift Management
                  </TabsTrigger>
                  <TabsTrigger
                    value="payments"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-4"
                  >
                    Payment System
                  </TabsTrigger>
                  <TabsTrigger
                    value="ratings"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-4"
                  >
                    Rating System
                  </TabsTrigger>
                  <TabsTrigger
                    value="reports"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-4"
                  >
                    Reports
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="projects" className="p-4">
                  <FreelanceProjectManagement
                    userRole={userRole}
                    onAddProject={handleAddProject}
                    onImportProjects={handleImportProjects}
                    onExportProjects={handleExportProjects}
                  />
                </TabsContent>

                <TabsContent value="shifts" className="p-4">
                  <FreelanceShiftManagement
                    userRole={userRole}
                    onAddShift={handleAddShift}
                    onImportShifts={handleImportShifts}
                    onExportShifts={handleExportShifts}
                    onTakeShift={handleTakeShift}
                    onCancelShift={handleCancelShift}
                    onAssignShift={handleAssignShift}
                  />
                </TabsContent>

                <TabsContent value="payments" className="p-4">
                  <FreelancePaymentSystem
                    userRole={userRole}
                    onApprovePayment={handleApprovePayment}
                    onRejectPayment={handleRejectPayment}
                    onViewPaymentDetails={handleViewPaymentDetails}
                    onExportPayments={handleExportPayments}
                  />
                </TabsContent>

                <TabsContent value="ratings" className="p-4">
                  <FreelanceRatingSystem
                    userRole={userRole}
                    onExportRatings={handleExportRatings}
                    onViewFreelancerDetails={handleViewFreelancerDetails}
                  />
                </TabsContent>

                <TabsContent value="reports" className="p-4">
                  <FreelanceReportingSystem
                    userRole={userRole}
                    onGenerateReport={handleGenerateReport}
                    onExportReport={handleExportReport}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FreelanceManagementDashboard;
