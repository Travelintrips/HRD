import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";
import { Branch, City, WorkArea, WorkPlace } from "@/types/database.types";

interface EmployeeFiltersProps {
  onFilterChange?: (filters: {
    branch: string;
    branchId: string;
    cityId: string;
    workAreaId: string;
    workPlaceId: string;
    division: string;
    status: string;
    search: string;
  }) => void;
}

const EmployeeFilters = ({ onFilterChange }: EmployeeFiltersProps = {}) => {
  const [filters, setFilters] = useState({
    branch: "",
    branchId: "",
    cityId: "",
    workAreaId: "",
    workPlaceId: "",
    division: "all",
    status: "all",
    search: "",
  });

  // State for location data
  const [cities, setCities] = useState<City[]>([]);
  const [workAreas, setWorkAreas] = useState<WorkArea[]>([]);
  const [workPlaces, setWorkPlaces] = useState<WorkPlace[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filteredWorkAreas, setFilteredWorkAreas] = useState<WorkArea[]>([]);
  const [filteredWorkPlaces, setFilteredWorkPlaces] = useState<WorkPlace[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch location data
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setLoading(true);
        // Fetch cities
        const { data: cityData } = await supabase
          .from("cities")
          .select("*")
          .order("name");
        setCities(cityData || []);

        // Fetch work areas
        const { data: workAreaData } = await supabase
          .from("work_areas")
          .select("*, cities!inner(name)")
          .order("name");
        setWorkAreas(workAreaData || []);

        // Fetch work places
        const { data: workPlaceData } = await supabase
          .from("work_places")
          .select("*, work_areas!inner(name, city_id, cities!inner(name))")
          .order("name");
        setWorkPlaces(workPlaceData || []);

        // Fetch branches
        const { data: branchData } = await supabase
          .from("branches")
          .select(
            "*, work_places!inner(name, work_area_id, work_areas!inner(name, city_id, cities!inner(name)))",
          )
          .order("name");
        setBranches(branchData || []);
      } catch (error) {
        console.error("Error fetching location data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  // Handlers for cascading dropdowns
  const handleCityChange = (value: string) => {
    // Reset dependent fields
    const newFilters = {
      ...filters,
      cityId: value === "all" ? "" : value,
      workAreaId: "",
      workPlaceId: "",
      branchId: "",
      branch: "",
    };
    setFilters(newFilters);

    // Filter work areas based on selected city
    const filtered = workAreas.filter((area) => area.city_id === value);
    setFilteredWorkAreas(filtered);
    setFilteredWorkPlaces([]);
    setFilteredBranches([]);

    onFilterChange?.(newFilters);
  };

  const handleWorkAreaChange = (value: string) => {
    // Reset dependent fields
    const newFilters = {
      ...filters,
      workAreaId: value === "all" ? "" : value,
      workPlaceId: "",
      branchId: "",
      branch: "",
    };
    setFilters(newFilters);

    // Filter work places based on selected work area
    const filtered = workPlaces.filter((place) => place.work_area_id === value);
    setFilteredWorkPlaces(filtered);
    setFilteredBranches([]);

    onFilterChange?.(newFilters);
  };

  const handleWorkPlaceChange = (value: string) => {
    // Reset dependent fields
    const newFilters = {
      ...filters,
      workPlaceId: value === "all" ? "" : value,
      branchId: "",
      branch: "",
    };
    setFilters(newFilters);

    // Filter branches based on selected work place
    const filtered = branches.filter(
      (branch) => branch.work_place_id === value,
    );
    setFilteredBranches(filtered);

    onFilterChange?.(newFilters);
  };

  const handleBranchChange = (value: string) => {
    // Find the branch name for display purposes
    const selectedBranch =
      value === "all" ? null : branches.find((b) => b.id === value);
    const newFilters = {
      ...filters,
      branchId: value === "all" ? "" : value,
      branch: selectedBranch?.name || "",
    };
    setFilters(newFilters);

    onFilterChange?.(newFilters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange("search", e.target.value);
  };

  const handleReset = () => {
    const resetFilters = {
      branch: "",
      branchId: "",
      cityId: "",
      workAreaId: "",
      workPlaceId: "",
      division: "all",
      status: "all",
      search: "",
    };
    setFilters(resetFilters);
    setFilteredWorkAreas([]);
    setFilteredWorkPlaces([]);
    setFilteredBranches([]);
    onFilterChange?.(resetFilters);
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search employees..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <Select
            value={filters.cityId || "all"}
            onValueChange={handleCityChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.workAreaId || "all"}
            onValueChange={handleWorkAreaChange}
            disabled={!filters.cityId}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Work Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Work Areas</SelectItem>
              {(filteredWorkAreas.length > 0 ? filteredWorkAreas : workAreas)
                .filter(
                  (area) => !filters.cityId || area.city_id === filters.cityId,
                )
                .map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.workPlaceId || "all"}
            onValueChange={handleWorkPlaceChange}
            disabled={!filters.workAreaId}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Work Place" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Work Places</SelectItem>
              {(filteredWorkPlaces.length > 0 ? filteredWorkPlaces : workPlaces)
                .filter(
                  (place) =>
                    !filters.workAreaId ||
                    place.work_area_id === filters.workAreaId,
                )
                .map((place) => (
                  <SelectItem key={place.id} value={place.id}>
                    {place.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.branchId || "all"}
            onValueChange={handleBranchChange}
            disabled={!filters.workPlaceId}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {(filteredBranches.length > 0 ? filteredBranches : branches)
                .filter(
                  (branch) =>
                    !filters.workPlaceId ||
                    branch.work_place_id === filters.workPlaceId,
                )
                .map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.division}
            onValueChange={(value) => handleFilterChange("division", value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Human Resources">Human Resources</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="permanent">Permanent</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="probation">Probation</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="ml-2"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFilters;
