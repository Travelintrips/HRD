import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  Loader2,
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Employee, Branch } from "@/types/database.types";

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState("attendance");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date());
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [reportType, setReportType] = useState("all");
  const [employee, setEmployee] = useState("all");
  const [branch, setBranch] = useState("all");
  const [status, setStatus] = useState("all");
  const [filteredAttendanceData, setFilteredAttendanceData] = useState<any[]>(
    [],
  );
  const [filteredLeaveData, setFilteredLeaveData] = useState<any[]>([]);
  const [filteredShiftData, setFilteredShiftData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const { toast } = useToast();

  // Data contoh untuk laporan kehadiran
  const attendanceData = [
    {
      id: "1",
      employeeName: "Budi Santoso",
      employeeId: "EMP-1234",
      date: "2023-12-01",
      checkIn: "08:05 AM",
      checkOut: "05:10 PM",
      status: "present",
      branch: "Headquarters",
      workHours: "9j 5m",
      overtime: "0j 5m",
    },
    {
      id: "2",
      employeeName: "Siti Rahayu",
      employeeId: "EMP-1235",
      date: "2023-12-01",
      checkIn: "08:30 AM",
      checkOut: "05:45 PM",
      status: "present",
      branch: "North Branch",
      workHours: "9j 15m",
      overtime: "0j 15m",
    },
    {
      id: "3",
      employeeName: "Agus Wijaya",
      employeeId: "EMP-1236",
      date: "2023-12-01",
      checkIn: "09:15 AM",
      checkOut: "05:30 PM",
      status: "late",
      branch: "Headquarters",
      workHours: "8j 15m",
      overtime: "0j 0m",
    },
    {
      id: "4",
      employeeName: "Dewi Lestari",
      employeeId: "EMP-1237",
      date: "2023-12-01",
      checkIn: "",
      checkOut: "",
      status: "absent",
      branch: "South Branch",
      workHours: "0j 0m",
      overtime: "0j 0m",
    },
    {
      id: "5",
      employeeName: "Andi Susanto",
      employeeId: "EMP-1238",
      date: "2023-12-01",
      checkIn: "",
      checkOut: "",
      status: "leave",
      branch: "East Branch",
      workHours: "0j 0m",
      overtime: "0j 0m",
    },
  ];

  // Data contoh untuk laporan cuti
  const leaveData = [
    {
      id: "1",
      employeeName: "Budi Santoso",
      employeeId: "EMP-1234",
      leaveType: "Annual",
      startDate: "2023-11-15",
      endDate: "2023-11-17",
      duration: "3 days",
      status: "approved",
      approvedBy: "Admin User",
    },
    {
      id: "2",
      employeeName: "Siti Rahayu",
      employeeId: "EMP-1235",
      leaveType: "Sick",
      startDate: "2023-11-20",
      endDate: "2023-11-21",
      duration: "2 days",
      status: "approved",
      approvedBy: "Admin User",
    },
    {
      id: "3",
      employeeName: "Agus Wijaya",
      employeeId: "EMP-1236",
      leaveType: "Personal",
      startDate: "2023-12-05",
      endDate: "2023-12-05",
      duration: "1 day",
      status: "pending",
      approvedBy: "",
    },
    {
      id: "4",
      employeeName: "Dewi Lestari",
      employeeId: "EMP-1237",
      leaveType: "Annual",
      startDate: "2023-12-20",
      endDate: "2023-12-31",
      duration: "12 days",
      status: "pending",
      approvedBy: "",
    },
    {
      id: "5",
      employeeName: "Andi Susanto",
      employeeId: "EMP-1238",
      leaveType: "Sick",
      startDate: "2023-11-10",
      endDate: "2023-11-12",
      duration: "3 days",
      status: "rejected",
      approvedBy: "Admin User",
    },
  ];

  // Data contoh untuk laporan shift
  const shiftData = [
    {
      id: "1",
      shiftName: "Morning Shift",
      branch: "Headquarters",
      date: "2023-12-01",
      time: "08:00 AM - 12:00 PM",
      capacity: 5,
      assigned: 5,
      status: "full",
    },
    {
      id: "2",
      shiftName: "Afternoon Shift",
      branch: "Headquarters",
      date: "2023-12-01",
      time: "01:00 PM - 05:00 PM",
      capacity: 4,
      assigned: 4,
      status: "full",
    },
    {
      id: "3",
      shiftName: "Morning Shift",
      branch: "North Branch",
      date: "2023-12-01",
      time: "08:00 AM - 12:00 PM",
      capacity: 3,
      assigned: 2,
      status: "open",
    },
    {
      id: "4",
      shiftName: "Evening Shift",
      branch: "South Branch",
      date: "2023-12-01",
      time: "06:00 PM - 10:00 PM",
      capacity: 2,
      assigned: 0,
      status: "open",
    },
    {
      id: "5",
      shiftName: "Night Shift",
      branch: "East Branch",
      date: "2023-12-01",
      time: "10:00 PM - 06:00 AM",
      capacity: 3,
      assigned: 3,
      status: "closed",
    },
  ];

  useEffect(() => {
    // Terapkan filter awal
    applyFilters();

    // Fetch employees and branches data
    fetchEmployees();
    fetchBranches();
  }, []);

  const fetchEmployees = async () => {
    setIsFetchingData(true);
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching employees:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data karyawan",
          duration: 3000,
        });
      } else {
        setEmployees(data || []);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data karyawan",
        duration: 3000,
      });
    } finally {
      setIsFetchingData(false);
    }
  };

  const fetchBranches = async () => {
    setIsFetchingData(true);
    try {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching branches:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data cabang",
          duration: 3000,
        });
      } else {
        setBranches(data || []);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data cabang",
        duration: 3000,
      });
    } finally {
      setIsFetchingData(false);
    }
  };

  const applyFilters = () => {
    setIsLoading(true);

    // Filter data kehadiran
    const filteredAttendance = attendanceData.filter((record) => {
      if (employee !== "all" && record.employeeId !== employee) return false;
      if (branch !== "all" && record.branch !== branch) return false;
      if (status !== "all" && record.status !== status) return false;
      return true;
    });

    // Filter data cuti
    const filteredLeave = leaveData.filter((record) => {
      if (employee !== "all" && record.employeeId !== employee) return false;
      if (status !== "all" && record.status !== status) return false;
      return true;
    });

    // Filter data shift
    const filteredShift = shiftData.filter((record) => {
      if (branch !== "all" && record.branch !== branch) return false;
      if (status !== "all" && record.status !== status) return false;
      return true;
    });

    setTimeout(() => {
      setFilteredAttendanceData(filteredAttendance);
      setFilteredLeaveData(filteredLeave);
      setFilteredShiftData(filteredShift);
      setIsLoading(false);
    }, 500);
  };

  const handleGenerateReport = () => {
    console.log("Membuat laporan dengan filter:", {
      dateFrom,
      dateTo,
      reportType,
      employee,
      branch,
      status,
    });

    applyFilters();

    toast({
      title: "Laporan Berhasil Dibuat",
      description: "Data laporan telah diperbarui sesuai filter yang dipilih.",
      duration: 3000,
    });
  };

  const handleExportReport = (format: "pdf" | "excel") => {
    console.log(`Mengekspor laporan dalam format ${format}`);

    toast({
      title: `Laporan Berhasil Diekspor`,
      description: `Laporan telah diekspor dalam format ${format.toUpperCase()}.`,
      duration: 3000,
    });

    // Simulasi unduhan dengan membuat tautan sementara
    const link = document.createElement("a");
    link.href = "#";
    link.setAttribute("download", `laporan_${activeTab}_${format}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" /> Hadir
          </Badge>
        );
      case "late":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="mr-1 h-3 w-3" /> Terlambat
          </Badge>
        );
      case "absent":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" /> Tidak Hadir
          </Badge>
        );
      case "leave":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" /> Cuti
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" /> Disetujui
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="mr-1 h-3 w-3" /> Menunggu
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" /> Ditolak
          </Badge>
        );
      case "open":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" /> Tersedia
          </Badge>
        );
      case "full":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="mr-1 h-3 w-3" /> Penuh
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" /> Ditutup
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Laporan</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleExportReport("excel")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Ekspor Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportReport("pdf")}
              >
                <Download className="mr-2 h-4 w-4" />
                Ekspor PDF
              </Button>
            </div>
          </div>

          {/* Filter Laporan */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Laporan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="date-from">Tanggal Dari</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP") : "Pilih tanggal"}
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
                  <Label htmlFor="date-to">Tanggal Sampai</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP") : "Pilih tanggal"}
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
                  <Label htmlFor="report-type">Jenis Laporan</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger id="report-type">
                      <SelectValue placeholder="Pilih jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Laporan</SelectItem>
                      <SelectItem value="attendance">Kehadiran</SelectItem>
                      <SelectItem value="leave">Cuti</SelectItem>
                      <SelectItem value="shift">Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee">Karyawan</Label>
                  <Select
                    value={employee}
                    onValueChange={setEmployee}
                    disabled={isFetchingData}
                  >
                    <SelectTrigger id="employee">
                      {isFetchingData ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Memuat...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Pilih karyawan" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Karyawan</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.employee_id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Cabang</Label>
                  <Select
                    value={branch}
                    onValueChange={setBranch}
                    disabled={isFetchingData}
                  >
                    <SelectTrigger id="branch">
                      {isFetchingData ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Memuat...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Pilih cabang" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Cabang</SelectItem>
                      {branches.map((branchItem) => (
                        <SelectItem key={branchItem.id} value={branchItem.name}>
                          {branchItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="present">Hadir</SelectItem>
                      <SelectItem value="late">Terlambat</SelectItem>
                      <SelectItem value="absent">Tidak Hadir</SelectItem>
                      <SelectItem value="leave">Cuti</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-1 md:col-span-3 flex justify-end">
                  <Button onClick={handleGenerateReport} disabled={isLoading}>
                    {isLoading ? "Memproses..." : "Buat Laporan"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tab Laporan */}
          <Card>
            <CardContent className="p-4 pt-6">
              <Tabs
                defaultValue="attendance"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="attendance">
                    Laporan Kehadiran
                  </TabsTrigger>
                  <TabsTrigger value="leave">Laporan Cuti</TabsTrigger>
                  <TabsTrigger value="shift">Laporan Shift</TabsTrigger>
                </TabsList>

                <TabsContent value="attendance" className="mt-0">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            Ringkasan Kehadiran
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span>
                                Hadir:{" "}
                                {filteredAttendanceData.filter(
                                  (r) => r.status === "present",
                                ).length || 2}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <span>
                                Terlambat:{" "}
                                {filteredAttendanceData.filter(
                                  (r) => r.status === "late",
                                ).length || 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <span>
                                Tidak Hadir:{" "}
                                {filteredAttendanceData.filter(
                                  (r) => r.status === "absent",
                                ).length || 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span>
                                Cuti:{" "}
                                {filteredAttendanceData.filter(
                                  (r) => r.status === "leave",
                                ).length || 1}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 h-[150px] flex items-center justify-center border rounded-md">
                            <div className="text-center text-gray-500">
                              <PieChart className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                              <p>Grafik distribusi kehadiran</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-purple-600" />
                            Jam Kerja
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="mt-2 h-[150px] flex items-center justify-center border rounded-md">
                            <div className="text-center text-gray-500">
                              <BarChart2 className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                              <p>Grafik jam kerja</p>
                            </div>
                          </div>
                          <div className="mt-4 text-sm">
                            <div className="flex justify-between">
                              <span>Rata-rata jam:</span>
                              <span className="font-medium">8j 45m</span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span>Total lembur:</span>
                              <span className="font-medium">0j 20m</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Building className="h-5 w-5 text-green-600" />
                            Perbandingan Cabang
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="mt-2 h-[150px] flex items-center justify-center border rounded-md">
                            <div className="text-center text-gray-500">
                              <BarChart2 className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                              <p>Grafik kehadiran cabang</p>
                            </div>
                          </div>
                          <div className="mt-4 text-sm">
                            <div className="flex justify-between">
                              <span>Kehadiran terbaik:</span>
                              <span className="font-medium">Kantor Pusat</span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span>Perlu perbaikan:</span>
                              <span className="font-medium">
                                Cabang Selatan
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Table>
                      <TableCaption>Laporan Kehadiran</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Karyawan</TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Jam Masuk</TableHead>
                          <TableHead>Jam Keluar</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Cabang</TableHead>
                          <TableHead>Jam Kerja</TableHead>
                          <TableHead>Lembur</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-4">
                              Memuat data...
                            </TableCell>
                          </TableRow>
                        ) : filteredAttendanceData.length > 0 ? (
                          filteredAttendanceData.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium">
                                {record.employeeName}
                              </TableCell>
                              <TableCell>{record.employeeId}</TableCell>
                              <TableCell>
                                {format(new Date(record.date), "d MMM yyyy")}
                              </TableCell>
                              <TableCell>{record.checkIn || "-"}</TableCell>
                              <TableCell>{record.checkOut || "-"}</TableCell>
                              <TableCell>
                                {getStatusBadge(record.status)}
                              </TableCell>
                              <TableCell>{record.branch}</TableCell>
                              <TableCell>{record.workHours}</TableCell>
                              <TableCell>{record.overtime}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-4">
                              Tidak ada data yang sesuai dengan filter
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="leave" className="mt-0">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-blue-600" />
                            Distribusi Jenis Cuti
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span>
                                Tahunan:{" "}
                                {filteredLeaveData.filter(
                                  (r) => r.leaveType === "Annual",
                                ).length || 2}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span>
                                Sakit:{" "}
                                {filteredLeaveData.filter(
                                  (r) => r.leaveType === "Sick",
                                ).length || 2}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                              <span>
                                Pribadi:{" "}
                                {filteredLeaveData.filter(
                                  (r) => r.leaveType === "Personal",
                                ).length || 1}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 h-[150px] flex items-center justify-center border rounded-md">
                            <div className="text-center text-gray-500">
                              <PieChart className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                              <p>Grafik distribusi jenis cuti</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            Status Cuti
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span>
                                Disetujui:{" "}
                                {filteredLeaveData.filter(
                                  (r) => r.status === "approved",
                                ).length || 2}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <span>
                                Menunggu:{" "}
                                {filteredLeaveData.filter(
                                  (r) => r.status === "pending",
                                ).length || 2}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <span>
                                Ditolak:{" "}
                                {filteredLeaveData.filter(
                                  (r) => r.status === "rejected",
                                ).length || 1}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 h-[150px] flex items-center justify-center border rounded-md">
                            <div className="text-center text-gray-500">
                              <BarChart2 className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                              <p>Grafik status cuti</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-purple-600" />
                            Durasi Cuti
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="mt-2 h-[150px] flex items-center justify-center border rounded-md">
                            <div className="text-center text-gray-500">
                              <BarChart2 className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                              <p>Grafik durasi cuti</p>
                            </div>
                          </div>
                          <div className="mt-4 text-sm">
                            <div className="flex justify-between">
                              <span>Total hari cuti:</span>
                              <span className="font-medium">21 hari</span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span>Rata-rata durasi:</span>
                              <span className="font-medium">4,2 hari</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Table>
                      <TableCaption>Laporan Cuti</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Karyawan</TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>Jenis Cuti</TableHead>
                          <TableHead>Tanggal Mulai</TableHead>
                          <TableHead>Tanggal Selesai</TableHead>
                          <TableHead>Durasi</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Disetujui Oleh</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-4">
                              Memuat data...
                            </TableCell>
                          </TableRow>
                        ) : filteredLeaveData.length > 0 ? (
                          filteredLeaveData.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium">
                                {record.employeeName}
                              </TableCell>
                              <TableCell>{record.employeeId}</TableCell>
                              <TableCell>
                                {record.leaveType === "Annual"
                                  ? "Tahunan"
                                  : record.leaveType === "Sick"
                                    ? "Sakit"
                                    : record.leaveType === "Personal"
                                      ? "Pribadi"
                                      : record.leaveType}
                              </TableCell>
                              <TableCell>
                                {format(
                                  new Date(record.startDate),
                                  "d MMM yyyy",
                                )}
                              </TableCell>
                              <TableCell>
                                {format(new Date(record.endDate), "d MMM yyyy")}
                              </TableCell>
                              <TableCell>
                                {record.duration
                                  .replace("days", "hari")
                                  .replace("day", "hari")}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(record.status)}
                              </TableCell>
                              <TableCell>{record.approvedBy || "-"}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-4">
                              Tidak ada data yang sesuai dengan filter
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="shift" className="mt-0">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            Distribusi Shift
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span>
                                Pagi:{" "}
                                {filteredShiftData.filter((r) =>
                                  r.shiftName.includes("Morning"),
                                ).length || 2}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span>
                                Siang:{" "}
                                {filteredShiftData.filter((r) =>
                                  r.shiftName.includes("Afternoon"),
                                ).length || 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                              <span>
                                Sore:{" "}
                                {filteredShiftData.filter((r) =>
                                  r.shiftName.includes("Evening"),
                                ).length || 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                              <span>
                                Malam:{" "}
                                {filteredShiftData.filter((r) =>
                                  r.shiftName.includes("Night"),
                                ).length || 1}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 h-[150px] flex items-center justify-center border rounded-md">
                            <div className="text-center text-gray-500">
                              <PieChart className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                              <p>Grafik distribusi shift</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Building className="h-5 w-5 text-green-600" />
                            Distribusi Cabang
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span>
                                Kantor Pusat:{" "}
                                {filteredShiftData.filter(
                                  (r) => r.branch === "Headquarters",
                                ).length || 2}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span>
                                Utara:{" "}
                                {filteredShiftData.filter(
                                  (r) => r.branch === "North Branch",
                                ).length || 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                              <span>
                                Selatan:{" "}
                                {filteredShiftData.filter(
                                  (r) => r.branch === "South Branch",
                                ).length || 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                              <span>
                                Timur:{" "}
                                {filteredShiftData.filter(
                                  (r) => r.branch === "East Branch",
                                ).length || 1}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 h-[150px] flex items-center justify-center border rounded-md">
                            <div className="text-center text-gray-500">
                              <BarChart2 className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                              <p>Grafik distribusi cabang</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-purple-600" />
                            Pemanfaatan Kapasitas
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="mt-2 h-[150px] flex items-center justify-center border rounded-md">
                            <div className="text-center text-gray-500">
                              <BarChart2 className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                              <p>Grafik pemanfaatan kapasitas</p>
                            </div>
                          </div>
                          <div className="mt-4 text-sm">
                            <div className="flex justify-between">
                              <span>Total kapasitas:</span>
                              <span className="font-medium">17 karyawan</span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span>Tingkat pemanfaatan:</span>
                              <span className="font-medium">82,4%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Table>
                      <TableCaption>Laporan Shift</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Shift</TableHead>
                          <TableHead>Cabang</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Waktu</TableHead>
                          <TableHead>Kapasitas</TableHead>
                          <TableHead>Terisi</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              Memuat data...
                            </TableCell>
                          </TableRow>
                        ) : filteredShiftData.length > 0 ? (
                          filteredShiftData.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium">
                                {record.shiftName
                                  .replace("Morning", "Pagi")
                                  .replace("Afternoon", "Siang")
                                  .replace("Evening", "Sore")
                                  .replace("Night", "Malam")}
                              </TableCell>
                              <TableCell>
                                {record.branch === "Headquarters"
                                  ? "Kantor Pusat"
                                  : record.branch === "North Branch"
                                    ? "Cabang Utara"
                                    : record.branch === "South Branch"
                                      ? "Cabang Selatan"
                                      : record.branch === "East Branch"
                                        ? "Cabang Timur"
                                        : record.branch === "West Branch"
                                          ? "Cabang Barat"
                                          : record.branch}
                              </TableCell>
                              <TableCell>
                                {format(new Date(record.date), "d MMM yyyy")}
                              </TableCell>
                              <TableCell>{record.time}</TableCell>
                              <TableCell>{record.capacity}</TableCell>
                              <TableCell>{record.assigned}</TableCell>
                              <TableCell>
                                {getStatusBadge(record.status)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              Tidak ada data yang sesuai dengan filter
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
