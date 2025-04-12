import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { LeaveRequest } from "@/types/database.types";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  FileText,
  Plus,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import LeaveRequestForm from "@/components/leave/LeaveRequestForm";
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

const LeavesPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);

  // Fetch leave requests from Supabase
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Join with employees table to get employee names
      const { data, error } = await supabase.from("leave_requests").select(`
          *,
          employees:employee_id (name)
        `);

      if (error) {
        throw error;
      }

      // Transform data to match the expected format
      const formattedData = data.map((req) => ({
        id: req.id,
        employeeName: req.employees?.name || "Unknown Employee",
        leaveType: req.leave_type,
        startDate: req.start_date,
        endDate: req.end_date,
        status: req.status,
        reason: req.reason,
        employeeId: req.employee_id,
      }));

      setLeaveRequests(formattedData);
    } catch (err: any) {
      console.error("Error fetching leave requests:", err);
      setError(err.message);
      toast({
        title: "Error fetching leave requests",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees from Supabase
  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("name");

      if (error) {
        throw error;
      }

      setEmployees(data || []);
    } catch (err: any) {
      console.error("Error fetching employees:", err);
      toast({
        title: "Error fetching employees",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Fetch leave requests and employees on component mount
  useEffect(() => {
    fetchEmployees();
    fetchLeaveRequests();

    // Set up real-time subscription
    const leaveRequestsSubscription = supabase
      .channel("leave-requests-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leave_requests",
        },
        () => {
          fetchLeaveRequests();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(leaveRequestsSubscription);
    };
  }, []);

  const pendingRequests = leaveRequests.filter(
    (req) => req.status === "pending",
  );
  const approvedRequests = leaveRequests.filter(
    (req) => req.status === "approved",
  );
  const rejectedRequests = leaveRequests.filter(
    (req) => req.status === "rejected",
  );

  const handleRequestLeave = () => {
    setShowLeaveForm(true);
  };

  const handleLeaveFormSubmit = async (data: any) => {
    try {
      console.log("Leave form submitted with data:", data);
      // The actual submission is now handled in the LeaveRequestForm component
      // This function is called after successful submission

      setShowLeaveForm(false);
      fetchLeaveRequests();
    } catch (err: any) {
      console.error("Error in leave form submission callback:", err);
    }
  };

  const handleApproveLeave = async (id: string) => {
    try {
      const { error } = await supabase
        .from("leave_requests")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Leave request has been approved`,
      });

      fetchLeaveRequests();
    } catch (err: any) {
      console.error("Error approving leave request:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleRejectLeave = async (id: string) => {
    try {
      const { error } = await supabase
        .from("leave_requests")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Leave request has been rejected`,
      });

      fetchLeaveRequests();
    } catch (err: any) {
      console.error("Error rejecting leave request:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleViewLeaveStatus = () => {
    console.log("Viewing leave status");
    // Here you would navigate to the leave status page or open a modal
    // Example: navigate('/leaves/status');

    // For demonstration, we'll show an alert
    alert("Menampilkan status cuti");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Leave Management
            </h1>
            <div className="flex gap-2">
              <Button onClick={handleRequestLeave}>
                <Plus className="mr-2 h-4 w-4" />
                Request Leave
              </Button>
              <Button variant="outline" onClick={handleViewLeaveStatus}>
                <FileText className="mr-2 h-4 w-4" />
                View Status
              </Button>
              <Button
                variant="outline"
                onClick={fetchLeaveRequests}
                disabled={loading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="pending"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-0">
                  {error && (
                    <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
                      {error}
                    </div>
                  )}

                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <RefreshCw className="animate-spin h-8 w-8 text-primary" />
                    </div>
                  ) : (
                    <Table>
                      <TableCaption>
                        List of pending leave requests
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Leave Type</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingRequests.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6">
                              No pending leave requests
                            </TableCell>
                          </TableRow>
                        ) : (
                          pendingRequests.map((request) => (
                            <TableRow
                              key={request.id}
                              className="hover:bg-gray-50"
                            >
                              <TableCell>{request.employeeName}</TableCell>
                              <TableCell>{request.leaveType}</TableCell>
                              <TableCell>
                                {formatDate(request.startDate)} -{" "}
                                {formatDate(request.endDate)}
                              </TableCell>
                              <TableCell>{request.reason}</TableCell>
                              <TableCell>
                                {getStatusBadge(request.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600"
                                    onClick={() =>
                                      handleApproveLeave(request.id)
                                    }
                                  >
                                    <CheckCircle className="mr-1 h-4 w-4" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600"
                                    onClick={() =>
                                      handleRejectLeave(request.id)
                                    }
                                  >
                                    <XCircle className="mr-1 h-4 w-4" />
                                    Reject
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="approved" className="mt-0">
                  <Table>
                    <TableCaption>List of approved leave requests</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            No approved leave requests
                          </TableCell>
                        </TableRow>
                      ) : (
                        approvedRequests.map((request) => (
                          <TableRow
                            key={request.id}
                            className="hover:bg-gray-50"
                          >
                            <TableCell>{request.employeeName}</TableCell>
                            <TableCell>{request.leaveType}</TableCell>
                            <TableCell>
                              {formatDate(request.startDate)} -{" "}
                              {formatDate(request.endDate)}
                            </TableCell>
                            <TableCell>{request.reason}</TableCell>
                            <TableCell>
                              {getStatusBadge(request.status)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="rejected" className="mt-0">
                  <Table>
                    <TableCaption>List of rejected leave requests</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rejectedRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            No rejected leave requests
                          </TableCell>
                        </TableRow>
                      ) : (
                        rejectedRequests.map((request) => (
                          <TableRow
                            key={request.id}
                            className="hover:bg-gray-50"
                          >
                            <TableCell>{request.employeeName}</TableCell>
                            <TableCell>{request.leaveType}</TableCell>
                            <TableCell>
                              {formatDate(request.startDate)} -{" "}
                              {formatDate(request.endDate)}
                            </TableCell>
                            <TableCell>{request.reason}</TableCell>
                            <TableCell>
                              {getStatusBadge(request.status)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Leave Request Form Dialog */}
      {showLeaveForm && (
        <LeaveRequestForm
          open={showLeaveForm}
          onClose={() => setShowLeaveForm(false)}
          onSubmit={handleLeaveFormSubmit}
          employees={employees}
        />
      )}
    </DashboardLayout>
  );
};

export default LeavesPage;
