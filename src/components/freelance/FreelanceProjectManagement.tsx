import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Download, Upload, Star, Clock } from "lucide-react";
import FreelanceProjectTable from "./FreelanceProjectTable";
import FreelanceProjectFilters from "./FreelanceProjectFilters";

interface FreelanceProjectManagementProps {
  userRole?: "admin" | "supervisor" | "freelancer";
  onAddProject?: () => void;
  onImportProjects?: () => void;
  onExportProjects?: () => void;
}

const FreelanceProjectManagement = ({
  userRole = "admin",
  onAddProject = () => {},
  onImportProjects = () => {},
  onExportProjects = () => {},
}: FreelanceProjectManagementProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    paymentType: "",
    search: "",
  });

  // Mock data for different tabs
  const allProjects = [
    {
      id: "1",
      title: "Website Redesign",
      description: "Redesign company website with modern UI",
      category: "Web Development",
      status: "ongoing",
      deadline: "2023-12-15",
      paymentType: "project",
      budget: "$2,500",
      assignedTo: "John Doe",
      rating: 0,
      progress: 65,
    },
    {
      id: "2",
      title: "Mobile App Development",
      description: "Create a mobile app for inventory management",
      category: "Mobile Development",
      status: "pending",
      deadline: "2023-12-30",
      paymentType: "hourly",
      budget: "$45/hour",
      assignedTo: "",
      rating: 0,
      progress: 0,
    },
    {
      id: "3",
      title: "SEO Optimization",
      description: "Improve website SEO ranking",
      category: "Digital Marketing",
      status: "completed",
      deadline: "2023-11-30",
      paymentType: "project",
      budget: "$1,200",
      assignedTo: "Jane Smith",
      rating: 5,
      progress: 100,
    },
    {
      id: "4",
      title: "Content Writing",
      description: "Create blog posts for company website",
      category: "Content Creation",
      status: "rejected",
      deadline: "2023-11-25",
      paymentType: "hourly",
      budget: "$25/hour",
      assignedTo: "Robert Johnson",
      rating: 2,
      progress: 30,
    },
    {
      id: "5",
      title: "Logo Design",
      description: "Design new company logo",
      category: "Graphic Design",
      status: "completed",
      deadline: "2023-11-20",
      paymentType: "project",
      budget: "$800",
      assignedTo: "Emily Davis",
      rating: 4,
      progress: 100,
    },
  ];

  const availableProjects = allProjects.filter(
    (project) => project.status === "pending" || project.assignedTo === "",
  );

  const ongoingProjects = allProjects.filter(
    (project) => project.status === "ongoing",
  );

  const completedProjects = allProjects.filter(
    (project) => project.status === "completed",
  );

  const handleFilterChange = (newFilters: {
    status: string;
    category: string;
    paymentType: string;
    search: string;
  }) => {
    console.log("Applying filters:", newFilters);
    setFilters(newFilters);
  };

  const handleTakeProject = (projectId: string) => {
    console.log(`Taking project with ID: ${projectId}`);
    // Here you would save the project selection to the database
    // Example API call: await api.freelance.takeProject(projectId, userId);

    // Show success message to user
    alert(`Berhasil mengambil proyek dengan ID: ${projectId}`);
  };

  const handleCompleteProject = (projectId: string) => {
    console.log(`Marking project with ID: ${projectId} as completed`);
    // Here you would update the project status in the database
    // Example API call: await api.freelance.completeProject(projectId);

    // Show success message to user
    alert(`Proyek dengan ID: ${projectId} telah ditandai sebagai selesai`);
  };

  // Filter projects based on current filters
  const filterProjects = (projects: typeof allProjects) => {
    return projects.filter((project) => {
      const matchesStatus =
        !filters.status ||
        project.status.toLowerCase().includes(filters.status.toLowerCase());
      const matchesCategory =
        !filters.category ||
        project.category.toLowerCase().includes(filters.category.toLowerCase());
      const matchesPaymentType =
        !filters.paymentType ||
        project.paymentType
          .toLowerCase()
          .includes(filters.paymentType.toLowerCase());
      const matchesSearch =
        !filters.search ||
        project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description
          .toLowerCase()
          .includes(filters.search.toLowerCase());

      return (
        matchesStatus && matchesCategory && matchesPaymentType && matchesSearch
      );
    });
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <CardTitle className="text-xl font-bold">
          Freelance Project Management
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          {userRole === "admin" && (
            <>
              <Button size="sm" variant="outline" onClick={onExportProjects}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button size="sm" variant="outline" onClick={onImportProjects}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button size="sm" onClick={onAddProject}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </>
          )}
          {userRole === "freelancer" && (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"
              >
                <Clock className="mr-2 h-4 w-4" />
                Available Projects: {availableProjects.length}
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 px-3 py-1"
              >
                <Star className="mr-2 h-4 w-4" />
                Your Rating: 4.5/5
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <FreelanceProjectFilters onFilterChange={handleFilterChange} />

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <FreelanceProjectTable
              projects={filterProjects(allProjects)}
              userRole={userRole}
              onTakeProject={handleTakeProject}
              onCompleteProject={handleCompleteProject}
            />
          </TabsContent>

          <TabsContent value="available" className="mt-0">
            <FreelanceProjectTable
              projects={filterProjects(availableProjects)}
              userRole={userRole}
              onTakeProject={handleTakeProject}
            />
          </TabsContent>

          <TabsContent value="ongoing" className="mt-0">
            <FreelanceProjectTable
              projects={filterProjects(ongoingProjects)}
              userRole={userRole}
              onCompleteProject={handleCompleteProject}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            <FreelanceProjectTable
              projects={filterProjects(completedProjects)}
              userRole={userRole}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FreelanceProjectManagement;
