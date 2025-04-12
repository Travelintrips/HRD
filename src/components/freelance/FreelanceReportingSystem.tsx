import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Download,
  FileText,
  Calendar as CalendarIcon,
  BarChart2,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
} from "lucide-react";

interface FreelanceReportingSystemProps {
  userRole?: "admin" | "supervisor" | "freelancer";
  onGenerateReport?: (filters: any) => void;
  onExportReport?: (format: "pdf" | "excel") => void;
}

const FreelanceReportingSystem = ({
  userRole = "admin",
  onGenerateReport = (filters: any) => {
    console.log("Generating report with filters:", filters);
    alert("Report generated successfully");
  },
  onExportReport = (format: "pdf" | "excel") => {
    console.log(`Exporting report in ${format} format`);
    alert(`Report has been exported in ${format.toUpperCase()} format`);
  },
}: FreelanceReportingSystemProps) => {
  const [activeTab, setActiveTab] = useState("projects");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date());
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [reportType, setReportType] = useState("all");
  const [freelancer, setFreelancer] = useState("all");
  const [projectStatus, setProjectStatus] = useState("all");

  const handleGenerateReport = () => {
    const filters = {
      dateFrom,
      dateTo,
      reportType,
      freelancer,
      projectStatus,
    };
    onGenerateReport(filters);
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <CardTitle className="text-xl font-bold">
          Freelance Reporting System
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onExportReport("excel")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onExportReport("pdf")}
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Report Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 border rounded-md bg-gray-50">
          <div className="space-y-2">
            <Label htmlFor="date-from">Date From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-to">Date To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
                <SelectItem value="payments">Payments</SelectItem>
                <SelectItem value="ratings">Ratings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="freelancer">Freelancer</Label>
            <Select value={freelancer} onValueChange={setFreelancer}>
              <SelectTrigger id="freelancer">
                <SelectValue placeholder="Select freelancer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Freelancers</SelectItem>
                <SelectItem value="1">John Doe</SelectItem>
                <SelectItem value="2">Jane Smith</SelectItem>
                <SelectItem value="3">Robert Johnson</SelectItem>
                <SelectItem value="4">Emily Davis</SelectItem>
                <SelectItem value="5">Michael Wilson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-status">Project Status</Label>
            <Select value={projectStatus} onValueChange={setProjectStatus}>
              <SelectTrigger id="project-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-5 flex justify-end">
            <Button onClick={handleGenerateReport}>Generate Report</Button>
          </div>
        </div>

        {/* Report Tabs */}
        <Tabs
          defaultValue="projects"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="projects">Project Reports</TabsTrigger>
            <TabsTrigger value="payments">Payment Reports</TabsTrigger>
            <TabsTrigger value="performance">Performance Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-blue-600" />
                    Project Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center border rounded-md">
                    <div className="text-center text-gray-500">
                      <PieChart className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                      <p>Chart will be displayed here</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Ongoing (15)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Completed (28)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>Pending (8)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Rejected (4)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Project Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center border rounded-md">
                    <div className="text-center text-gray-500">
                      <BarChart2 className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                      <p>Chart will be displayed here</p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm">
                    <div className="flex justify-between">
                      <span>Average completion time:</span>
                      <span className="font-medium">12 days</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Projects completed on time:</span>
                      <span className="font-medium">85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    Freelancer Project Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center border rounded-md">
                    <div className="text-center text-gray-500">
                      <BarChart2 className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                      <p>Chart will be displayed here</p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm">
                    <div className="flex justify-between">
                      <span>Top freelancer:</span>
                      <span className="font-medium">
                        John Doe (15 projects)
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Unassigned projects:</span>
                      <span className="font-medium">8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center border rounded-md">
                    <div className="text-center text-gray-500">
                      <BarChart2 className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                      <p>Chart will be displayed here</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total payments:</span>
                      <span className="font-medium">$45,280</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total bonuses:</span>
                      <span className="font-medium text-green-600">$2,670</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total penalties:</span>
                      <span className="font-medium text-red-600">$915</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Payment Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center border rounded-md">
                    <div className="text-center text-gray-500">
                      <TrendingUp className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                      <p>Chart will be displayed here</p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly average:</span>
                      <span className="font-medium">$15,093</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Growth rate:</span>
                      <span className="font-medium text-green-600">+12.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    Payment Type Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center border rounded-md">
                    <div className="text-center text-gray-500">
                      <PieChart className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                      <p>Chart will be displayed here</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Project-based (65%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Hourly-based (35%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Rating Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center border rounded-md">
                    <div className="text-center text-gray-500">
                      <BarChart2 className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                      <p>Chart will be displayed here</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <div>5 ★</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="bg-green-500 h-full"
                          style={{ width: "45%" }}
                        ></div>
                      </div>
                      <div>45%</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div>4 ★</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="bg-green-500 h-full"
                          style={{ width: "30%" }}
                        ></div>
                      </div>
                      <div>30%</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div>3 ★</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="bg-yellow-500 h-full"
                          style={{ width: "15%" }}
                        ></div>
                      </div>
                      <div>15%</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div>2 ★</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="bg-red-500 h-full"
                          style={{ width: "7%" }}
                        ></div>
                      </div>
                      <div>7%</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div>1 ★</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="bg-red-500 h-full"
                          style={{ width: "3%" }}
                        ></div>
                      </div>
                      <div>3%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50"
                      >
                        <div className="font-bold text-lg text-gray-500 w-5 text-center">
                          {i}
                        </div>
                        <div className="h-8 w-8 rounded-full overflow-hidden">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Freelancer${i}`}
                            alt={`Freelancer ${i}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {
                              [
                                "Jane Smith",
                                "John Doe",
                                "Emily Davis",
                                "Alex Johnson",
                                "Sarah Williams",
                              ][i - 1]
                            }
                          </div>
                          <div className="flex items-center">
                            {Array(5)
                              .fill(0)
                              .map((_, j) => (
                                <Star
                                  key={j}
                                  className={cn(
                                    "h-3 w-3",
                                    j < 5 - Math.floor(i / 2)
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300",
                                  )}
                                />
                              ))}
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {[24, 18, 15, 12, 10][i - 1]} projects
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center border rounded-md">
                    <div className="text-center text-gray-500">
                      <TrendingUp className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                      <p>Chart will be displayed here</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Average rating:</span>
                      <span className="font-medium">4.2/5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>On-time completion:</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Client satisfaction:</span>
                      <span className="font-medium">88%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FreelanceReportingSystem;
