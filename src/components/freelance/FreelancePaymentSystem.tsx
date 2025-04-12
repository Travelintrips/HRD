import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DollarSign,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  projectId: string;
  projectTitle: string;
  freelancerName: string;
  amount: string;
  status: "pending" | "approved" | "paid" | "rejected";
  paymentType: "project" | "hourly";
  hours?: number;
  rate?: string;
  date: string;
  rating: number;
  bonusAmount?: string;
}

interface FreelancePaymentSystemProps {
  userRole?: "admin" | "supervisor" | "freelancer";
  onApprovePayment?: (id: string) => void;
  onRejectPayment?: (id: string) => void;
  onViewPaymentDetails?: (id: string) => void;
  onExportPayments?: () => void;
}

const FreelancePaymentSystem = ({
  userRole = "admin",
  onApprovePayment = (id: string) => {
    console.log(`Payment ${id} approved`);
    alert(`Payment ${id} has been approved successfully`);
  },
  onRejectPayment = (id: string) => {
    console.log(`Payment ${id} rejected`);
    alert(`Payment ${id} has been rejected`);
  },
  onViewPaymentDetails = (id: string) => {
    console.log(`Viewing payment details for ${id}`);
  },
  onExportPayments = () => {
    console.log("Exporting payments");
    alert("Payment report has been exported successfully");
  },
}: FreelancePaymentSystemProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [paymentDetailsOpen, setPaymentDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Mock data for payments
  const allPayments: Payment[] = [
    {
      id: "1",
      projectId: "1",
      projectTitle: "Website Redesign",
      freelancerName: "John Doe",
      amount: "$2,500",
      status: "paid",
      paymentType: "project",
      date: "2023-11-15",
      rating: 5,
      bonusAmount: "$250",
    },
    {
      id: "2",
      projectId: "3",
      projectTitle: "SEO Optimization",
      freelancerName: "Jane Smith",
      amount: "$1,200",
      status: "approved",
      paymentType: "project",
      date: "2023-11-30",
      rating: 5,
      bonusAmount: "$120",
    },
    {
      id: "3",
      projectId: "4",
      projectTitle: "Content Writing",
      freelancerName: "Robert Johnson",
      amount: "$375",
      status: "pending",
      paymentType: "hourly",
      hours: 15,
      rate: "$25/hour",
      date: "2023-12-05",
      rating: 2,
    },
    {
      id: "4",
      projectId: "5",
      projectTitle: "Logo Design",
      freelancerName: "Emily Davis",
      amount: "$880",
      status: "paid",
      paymentType: "project",
      date: "2023-11-25",
      rating: 4,
      bonusAmount: "$80",
    },
    {
      id: "5",
      projectId: "6",
      projectTitle: "Mobile App Bug Fixes",
      freelancerName: "Michael Wilson",
      amount: "$540",
      status: "rejected",
      paymentType: "hourly",
      hours: 12,
      rate: "$45/hour",
      date: "2023-12-10",
      rating: 1,
    },
  ];

  const pendingPayments = allPayments.filter(
    (payment) => payment.status === "pending",
  );

  const approvedPayments = allPayments.filter(
    (payment) => payment.status === "approved",
  );

  const paidPayments = allPayments.filter(
    (payment) => payment.status === "paid",
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setPaymentDetailsOpen(true);
  };

  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300",
            )}
          />
        ))}
      </div>
    );
  };

  const renderPaymentTable = (payments: Payment[]) => {
    return (
      <Table>
        <TableCaption>List of freelance payments</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Freelancer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6">
                No payments found
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="font-medium">{payment.projectTitle}</div>
                </TableCell>
                <TableCell>{payment.freelancerName}</TableCell>
                <TableCell>
                  <div className="font-medium">{payment.amount}</div>
                  {payment.bonusAmount && (
                    <div className="text-xs text-green-600">
                      +{payment.bonusAmount} bonus
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {payment.paymentType === "project" ? (
                    "Project-based"
                  ) : (
                    <>
                      Hourly ({payment.hours} hrs @ {payment.rate})
                    </>
                  )}
                </TableCell>
                <TableCell>{formatDate(payment.date)}</TableCell>
                <TableCell>
                  <Badge className={cn(getStatusColor(payment.status))}>
                    {payment.status.charAt(0).toUpperCase() +
                      payment.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <RatingStars rating={payment.rating} />
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
                        onClick={() => handleViewPaymentDetails(payment)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>

                      {userRole === "admin" && payment.status === "pending" && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onApprovePayment(payment.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onRejectPayment(payment.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject Payment
                          </DropdownMenuItem>
                        </>
                      )}
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
              Total Payments: {payments.length}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <CardTitle className="text-xl font-bold">
          Freelance Payment System
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          {userRole === "admin" && (
            <Button size="sm" variant="outline" onClick={onExportPayments}>
              <Download className="mr-2 h-4 w-4" />
              Export Payments
            </Button>
          )}
          {userRole === "freelancer" && (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 px-3 py-1"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Total Earnings: $4,580
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">All Payments</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {renderPaymentTable(allPayments)}
          </TabsContent>

          <TabsContent value="pending" className="mt-0">
            {renderPaymentTable(pendingPayments)}
          </TabsContent>

          <TabsContent value="approved" className="mt-0">
            {renderPaymentTable(approvedPayments)}
          </TabsContent>

          <TabsContent value="paid" className="mt-0">
            {renderPaymentTable(paidPayments)}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Payment Details Dialog */}
      <Dialog open={paymentDetailsOpen} onOpenChange={setPaymentDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-sm text-gray-500">Project</Label>
                  <div className="font-medium">
                    {selectedPayment.projectTitle}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Freelancer</Label>
                  <div className="font-medium">
                    {selectedPayment.freelancerName}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Amount</Label>
                  <div className="font-medium">{selectedPayment.amount}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Status</Label>
                  <Badge className={cn(getStatusColor(selectedPayment.status))}>
                    {selectedPayment.status.charAt(0).toUpperCase() +
                      selectedPayment.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Payment Type</Label>
                  <div className="font-medium">
                    {selectedPayment.paymentType === "project"
                      ? "Project-based"
                      : "Hourly-based"}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Date</Label>
                  <div className="font-medium">
                    {formatDate(selectedPayment.date)}
                  </div>
                </div>
                {selectedPayment.paymentType === "hourly" && (
                  <>
                    <div>
                      <Label className="text-sm text-gray-500">
                        Hours Worked
                      </Label>
                      <div className="font-medium">{selectedPayment.hours}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">
                        Hourly Rate
                      </Label>
                      <div className="font-medium">{selectedPayment.rate}</div>
                    </div>
                  </>
                )}
                <div>
                  <Label className="text-sm text-gray-500">Rating</Label>
                  <div className="font-medium flex items-center gap-2">
                    <RatingStars rating={selectedPayment.rating} />
                    <span>({selectedPayment.rating}/5)</span>
                  </div>
                </div>
                {selectedPayment.bonusAmount && (
                  <div>
                    <Label className="text-sm text-gray-500">
                      Bonus Amount
                    </Label>
                    <div className="font-medium text-green-600">
                      {selectedPayment.bonusAmount}
                    </div>
                  </div>
                )}
              </div>

              {userRole === "admin" && selectedPayment.status === "pending" && (
                <div className="mt-6 space-y-4">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add payment notes here..."
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => onRejectPayment(selectedPayment.id)}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => onApprovePayment(selectedPayment.id)}
                    >
                      Approve Payment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDetailsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FreelancePaymentSystem;
