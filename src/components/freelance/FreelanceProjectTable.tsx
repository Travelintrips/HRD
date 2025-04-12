import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
  Star,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
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
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "ongoing" | "completed" | "rejected";
  deadline: string;
  paymentType: "project" | "hourly";
  budget: string;
  assignedTo: string;
  rating: number;
  progress: number;
}

interface FreelanceProjectTableProps {
  projects?: Project[];
  userRole?: "admin" | "supervisor" | "freelancer";
  onViewProject?: (id: string) => void;
  onEditProject?: (id: string) => void;
  onDeleteProject?: (id: string) => void;
  onTakeProject?: (id: string) => void;
  onCompleteProject?: (id: string) => void;
  onRateProject?: (id: string, rating: number) => void;
}

const FreelanceProjectTable = ({
  projects = [],
  userRole = "admin",
  onViewProject = () => {},
  onEditProject = () => {},
  onDeleteProject = () => {},
  onTakeProject = () => {},
  onCompleteProject = () => {},
  onRateProject = () => {},
}: FreelanceProjectTableProps) => {
  const [sortField, setSortField] = useState<keyof Project | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<number>(0);

  const handleSort = (field: keyof Project) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "ongoing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "project":
        return "bg-purple-100 text-purple-800";
      case "hourly":
        return "bg-orange-100 text-orange-800";
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

  const handleRateProject = (id: string) => {
    console.log(`Opening rating dialog for project ID: ${id}`);
    setSelectedProjectId(id);
    setRatingDialogOpen(true);
  };

  const submitRating = () => {
    console.log(
      `Submitting rating ${selectedRating} for project ID: ${selectedProjectId}`,
    );
    // Here you would save the rating to the database
    // Example API call: await api.supervisor.rateProject(selectedProjectId, selectedRating);

    // Show success message to user
    alert(`Rating ${selectedRating}/5 berhasil diberikan untuk proyek`);

    onRateProject(selectedProjectId, selectedRating);
    setRatingDialogOpen(false);
    setSelectedRating(0);
  };

  const SortIcon = ({ field }: { field: keyof Project }) => {
    if (sortField !== field)
      return <ChevronDown className="ml-1 h-4 w-4 opacity-50" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  const RatingStars = ({
    rating,
    interactive = false,
    onChange,
  }: {
    rating: number;
    interactive?: boolean;
    onChange?: (rating: number) => void;
  }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-5 w-5",
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300",
              interactive && "cursor-pointer",
            )}
            onClick={() => interactive && onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-md shadow">
      <Table>
        <TableCaption>List of freelance projects and their status</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("title")}
            >
              <div className="flex items-center">
                Project
                <SortIcon field="title" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("category")}
            >
              <div className="flex items-center">
                Category
                <SortIcon field="category" />
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
              onClick={() => handleSort("deadline")}
            >
              <div className="flex items-center">
                Deadline
                <SortIcon field="deadline" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("paymentType")}
            >
              <div className="flex items-center">
                Payment
                <SortIcon field="paymentType" />
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center">Progress</div>
            </TableHead>
            {(userRole === "admin" || userRole === "supervisor") && (
              <TableHead>
                <div className="flex items-center">Rating</div>
              </TableHead>
            )}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProjects.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={userRole === "freelancer" ? 7 : 8}
                className="text-center py-6"
              >
                No projects found
              </TableCell>
            </TableRow>
          ) : (
            sortedProjects.map((project) => (
              <TableRow key={project.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="font-medium">{project.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-[200px]">
                    {project.description}
                  </div>
                </TableCell>
                <TableCell>{project.category}</TableCell>
                <TableCell>
                  <Badge className={cn(getStatusColor(project.status))}>
                    {project.status.charAt(0).toUpperCase() +
                      project.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(project.deadline)}</TableCell>
                <TableCell>
                  <Badge
                    className={cn(getPaymentTypeColor(project.paymentType))}
                  >
                    {project.paymentType === "project" ? "Project" : "Hourly"}:{" "}
                    {project.budget}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="w-full max-w-[120px]">
                    <Progress value={project.progress} className="h-2" />
                    <span className="text-xs text-gray-500 mt-1">
                      {project.progress}%
                    </span>
                  </div>
                </TableCell>
                {(userRole === "admin" || userRole === "supervisor") && (
                  <TableCell>
                    {project.status === "completed" ? (
                      <RatingStars rating={project.rating} />
                    ) : (
                      <span className="text-sm text-gray-500">Pending</span>
                    )}
                  </TableCell>
                )}
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
                        onClick={() => onViewProject(project.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>

                      {userRole === "admin" && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onEditProject(project.id)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteProject(project.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}

                      {userRole === "freelancer" &&
                        project.status === "pending" && (
                          <DropdownMenuItem
                            onClick={() => onTakeProject(project.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Take Project
                          </DropdownMenuItem>
                        )}

                      {userRole === "freelancer" &&
                        project.status === "ongoing" && (
                          <DropdownMenuItem
                            onClick={() => onCompleteProject(project.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Completed
                          </DropdownMenuItem>
                        )}

                      {(userRole === "admin" || userRole === "supervisor") &&
                        project.status === "completed" &&
                        project.rating === 0 && (
                          <DropdownMenuItem
                            onClick={() => handleRateProject(project.id)}
                          >
                            <Star className="mr-2 h-4 w-4" />
                            Rate Project
                          </DropdownMenuItem>
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
            <TableCell
              colSpan={userRole === "freelancer" ? 7 : 8}
              className="text-right"
            >
              Total Projects: {projects.length}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Project</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4">
              Please rate the freelancer's work on this project:
            </p>
            <div className="flex justify-center mb-4">
              <RatingStars
                rating={selectedRating}
                interactive={true}
                onChange={setSelectedRating}
              />
            </div>
            <div className="text-center text-sm font-medium">
              {selectedRating === 1 && "Poor"}
              {selectedRating === 2 && "Fair"}
              {selectedRating === 3 && "Good"}
              {selectedRating === 4 && "Very Good"}
              {selectedRating === 5 && "Excellent"}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRatingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={submitRating} disabled={selectedRating === 0}>
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FreelanceProjectTable;
