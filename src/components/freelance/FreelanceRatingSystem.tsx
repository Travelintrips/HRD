import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  Download,
  BarChart,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FreelancerRating {
  id: string;
  name: string;
  avatar: string;
  totalProjects: number;
  completedProjects: number;
  averageRating: number;
  ratingDistribution: number[];
  totalEarnings: string;
  bonusEarned: string;
  penaltyAmount: string;
  performanceTrend: "up" | "down" | "stable";
}

interface FreelanceRatingSystemProps {
  userRole?: "admin" | "supervisor" | "freelancer";
  onExportRatings?: () => void;
  onViewFreelancerDetails?: (id: string) => void;
}

const FreelanceRatingSystem = ({
  userRole = "admin",
  onExportRatings = () => {},
  onViewFreelancerDetails = () => {},
}: FreelanceRatingSystemProps) => {
  // Mock data for freelancer ratings
  const freelancerRatings: FreelancerRating[] = [
    {
      id: "1",
      name: "John Doe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      totalProjects: 15,
      completedProjects: 12,
      averageRating: 4.8,
      ratingDistribution: [0, 0, 1, 2, 9],
      totalEarnings: "$12,500",
      bonusEarned: "$1,250",
      penaltyAmount: "$0",
      performanceTrend: "up",
    },
    {
      id: "2",
      name: "Jane Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      totalProjects: 10,
      completedProjects: 10,
      averageRating: 5.0,
      ratingDistribution: [0, 0, 0, 0, 10],
      totalEarnings: "$8,200",
      bonusEarned: "$820",
      penaltyAmount: "$0",
      performanceTrend: "up",
    },
    {
      id: "3",
      name: "Robert Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
      totalProjects: 8,
      completedProjects: 5,
      averageRating: 2.4,
      ratingDistribution: [1, 2, 1, 1, 0],
      totalEarnings: "$3,750",
      bonusEarned: "$0",
      penaltyAmount: "$375",
      performanceTrend: "down",
    },
    {
      id: "4",
      name: "Emily Davis",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
      totalProjects: 12,
      completedProjects: 11,
      averageRating: 4.2,
      ratingDistribution: [0, 1, 1, 4, 5],
      totalEarnings: "$9,600",
      bonusEarned: "$480",
      penaltyAmount: "$0",
      performanceTrend: "stable",
    },
    {
      id: "5",
      name: "Michael Wilson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      totalProjects: 6,
      completedProjects: 4,
      averageRating: 1.8,
      ratingDistribution: [2, 1, 1, 0, 0],
      totalEarnings: "$2,700",
      bonusEarned: "$0",
      penaltyAmount: "$540",
      performanceTrend: "down",
    },
  ];

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
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const RatingDistribution = ({ distribution }: { distribution: number[] }) => {
    const total = distribution.reduce((acc, curr) => acc + curr, 0);

    return (
      <div className="space-y-1 w-full max-w-[150px]">
        {distribution
          .map((count, index) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-8 text-right">{5 - index} ★</div>
                <Progress value={percentage} className="h-2" />
                <div className="w-6 text-gray-500">{count}</div>
              </div>
            );
          })
          .reverse()}
      </div>
    );
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <span className="h-4 w-4 inline-block">―</span>;
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <CardTitle className="text-xl font-bold">
          Freelancer Rating System
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          {userRole === "admin" && (
            <Button size="sm" variant="outline" onClick={onExportRatings}>
              <Download className="mr-2 h-4 w-4" />
              Export Ratings
            </Button>
          )}
          <Button size="sm" variant="outline">
            <BarChart className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Table>
          <TableCaption>
            Freelancer performance ratings and bonus/penalty information
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Freelancer</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Distribution</TableHead>
              <TableHead>Earnings</TableHead>
              <TableHead>Bonus/Penalty</TableHead>
              <TableHead>Trend</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {freelancerRatings.map((freelancer) => (
              <TableRow key={freelancer.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <img
                        src={freelancer.avatar}
                        alt={freelancer.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="font-medium">{freelancer.name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {freelancer.completedProjects} / {freelancer.totalProjects}{" "}
                    completed
                  </div>
                  <Progress
                    value={
                      (freelancer.completedProjects /
                        freelancer.totalProjects) *
                      100
                    }
                    className="h-2 mt-1"
                  />
                </TableCell>
                <TableCell>
                  <RatingStars rating={freelancer.averageRating} />
                </TableCell>
                <TableCell>
                  <RatingDistribution
                    distribution={freelancer.ratingDistribution}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{freelancer.totalEarnings}</div>
                </TableCell>
                <TableCell>
                  {parseFloat(
                    freelancer.bonusEarned.replace(/[^0-9.-]+/g, ""),
                  ) > 0 ? (
                    <Badge className="bg-green-100 text-green-800">
                      +{freelancer.bonusEarned} Bonus
                    </Badge>
                  ) : parseFloat(
                      freelancer.penaltyAmount.replace(/[^0-9.-]+/g, ""),
                    ) > 0 ? (
                    <Badge className="bg-red-100 text-red-800">
                      -{freelancer.penaltyAmount} Penalty
                    </Badge>
                  ) : (
                    <span className="text-gray-500">None</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(freelancer.performanceTrend)}
                    <span className="capitalize text-sm">
                      {freelancer.performanceTrend}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewFreelancerDetails(freelancer.id)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={8} className="text-right">
                Total Freelancers: {freelancerRatings.length}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {userRole === "admin" && (
          <div className="mt-6 p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-medium mb-2">Rating System Rules</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Badge className="bg-green-100 text-green-800 mt-0.5">
                  5 Stars
                </Badge>
                <span>10% bonus on project payment</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge className="bg-green-100 text-green-800 mt-0.5">
                  4 Stars
                </Badge>
                <span>5% bonus on project payment</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge className="bg-yellow-100 text-yellow-800 mt-0.5">
                  3 Stars
                </Badge>
                <span>Standard payment, no bonus or penalty</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge className="bg-red-100 text-red-800 mt-0.5">
                  2 Stars
                </Badge>
                <span>5% penalty on project payment</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge className="bg-red-100 text-red-800 mt-0.5">1 Star</Badge>
                <span>
                  10% penalty on project payment and performance review
                </span>
              </li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FreelanceRatingSystem;
