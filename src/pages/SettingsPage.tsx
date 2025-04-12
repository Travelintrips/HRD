import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Globe,
  User,
  Bell,
  Shield,
  Database,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// City Dialog Component
interface CityDialogProps {
  open: boolean;
  onClose: () => void;
  cityForm: { name: string };
  setCityForm: React.Dispatch<React.SetStateAction<{ name: string }>>;
  isEditing: boolean;
  handleSubmitCity: () => Promise<void>;
}

const CityDialog = ({
  open,
  onClose,
  cityForm,
  setCityForm,
  isEditing,
  handleSubmitCity,
}: CityDialogProps) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit City" : "Add City"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="city-name">City Name *</Label>
          <Input
            id="city-name"
            value={cityForm.name}
            onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
            placeholder="Jakarta"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmitCity}>
          {isEditing ? "Update" : "Add"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Work Area Dialog Component
interface WorkAreaDialogProps {
  open: boolean;
  onClose: () => void;
  workAreaForm: { name: string; city_id: string };
  setWorkAreaForm: React.Dispatch<
    React.SetStateAction<{ name: string; city_id: string }>
  >;
  isEditing: boolean;
  cities: any[];
  handleSubmitWorkArea: () => Promise<void>;
}

const WorkAreaDialog = ({
  open,
  onClose,
  workAreaForm,
  setWorkAreaForm,
  isEditing,
  cities,
  handleSubmitWorkArea,
}: WorkAreaDialogProps) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Work Area" : "Add Work Area"}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="work-area-name">Work Area Name *</Label>
          <Input
            id="work-area-name"
            value={workAreaForm.name}
            onChange={(e) =>
              setWorkAreaForm({ ...workAreaForm, name: e.target.value })
            }
            placeholder="Central Jakarta"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city-id">City *</Label>
          <Select
            value={workAreaForm.city_id}
            onValueChange={(value) =>
              setWorkAreaForm({ ...workAreaForm, city_id: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmitWorkArea}>
          {isEditing ? "Update" : "Add"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Work Place Dialog Component
interface WorkPlaceDialogProps {
  open: boolean;
  onClose: () => void;
  workPlaceForm: { name: string; work_area_id: string };
  setWorkPlaceForm: React.Dispatch<
    React.SetStateAction<{ name: string; work_area_id: string }>
  >;
  isEditing: boolean;
  workAreas: any[];
  handleSubmitWorkPlace: () => Promise<void>;
}

const WorkPlaceDialog = ({
  open,
  onClose,
  workPlaceForm,
  setWorkPlaceForm,
  isEditing,
  workAreas,
  handleSubmitWorkPlace,
}: WorkPlaceDialogProps) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Work Place" : "Add Work Place"}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="work-place-name">Work Place Name *</Label>
          <Input
            id="work-place-name"
            value={workPlaceForm.name}
            onChange={(e) =>
              setWorkPlaceForm({ ...workPlaceForm, name: e.target.value })
            }
            placeholder="Business District"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="work-area-id">Work Area *</Label>
          <Select
            value={workPlaceForm.work_area_id}
            onValueChange={(value) =>
              setWorkPlaceForm({ ...workPlaceForm, work_area_id: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a work area" />
            </SelectTrigger>
            <SelectContent>
              {workAreas.map((workArea) => (
                <SelectItem key={workArea.id} value={workArea.id}>
                  {workArea.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmitWorkPlace}>
          {isEditing ? "Update" : "Add"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Branch Dialog Component
interface BranchDialogProps {
  open: boolean;
  onClose: () => void;
  branchForm: {
    name: string;
    code: string;
    work_place_id: string;
    city_id: string;
    work_area_id: string;
    address: string;
  };
  setBranchForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      code: string;
      work_place_id: string;
      city_id: string;
      work_area_id: string;
      address: string;
    }>
  >;
  isEditing: boolean;
  cities: any[];
  workAreas: any[];
  workPlaces: any[];
  handleSubmitBranch: () => Promise<void>;
  handleCityChange: (cityId: string) => void;
  handleWorkAreaChange: (workAreaId: string) => void;
}

const BranchDialog = ({
  open,
  onClose,
  branchForm,
  setBranchForm,
  isEditing,
  cities,
  workAreas,
  workPlaces,
  handleSubmitBranch,
  handleCityChange,
  handleWorkAreaChange,
}: BranchDialogProps) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Branch" : "Add Branch"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="branch-name">Branch Name *</Label>
          <Input
            id="branch-name"
            value={branchForm.name}
            onChange={(e) =>
              setBranchForm({ ...branchForm, name: e.target.value })
            }
            placeholder="Headquarters"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="branch-code">Branch Code</Label>
          <Input
            id="branch-code"
            value={branchForm.code}
            onChange={(e) =>
              setBranchForm({ ...branchForm, code: e.target.value })
            }
            placeholder="HQ"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city-id">City *</Label>
          <Select
            value={branchForm.city_id}
            onValueChange={(value) => {
              setBranchForm({
                ...branchForm,
                city_id: value,
                work_area_id: "",
                work_place_id: "",
              });
              handleCityChange(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="work-area-id">Work Area *</Label>
          <Select
            value={branchForm.work_area_id}
            onValueChange={(value) => {
              setBranchForm({
                ...branchForm,
                work_area_id: value,
                work_place_id: "",
              });
              handleWorkAreaChange(value);
            }}
            disabled={!branchForm.city_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a work area" />
            </SelectTrigger>
            <SelectContent>
              {workAreas.map((workArea) => (
                <SelectItem key={workArea.id} value={workArea.id}>
                  {workArea.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="work-place-id">Work Place *</Label>
          <Select
            value={branchForm.work_place_id}
            onValueChange={(value) =>
              setBranchForm({ ...branchForm, work_place_id: value })
            }
            disabled={!branchForm.work_area_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a work place" />
            </SelectTrigger>
            <SelectContent>
              {workPlaces.map((workPlace) => (
                <SelectItem key={workPlace.id} value={workPlace.id}>
                  {workPlace.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="branch-address">Address</Label>
          <Input
            id="branch-address"
            value={branchForm.address}
            onChange={(e) =>
              setBranchForm({ ...branchForm, address: e.target.value })
            }
            placeholder="123 Main Street"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmitBranch}>
          {isEditing ? "Update" : "Add"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Division Dialog Component
interface DivisionDialogProps {
  open: boolean;
  onClose: () => void;
  divisionForm: { name: string; code: string; description: string };
  setDivisionForm: React.Dispatch<
    React.SetStateAction<{ name: string; code: string; description: string }>
  >;
  isEditing: boolean;
  handleSubmitDivision: () => Promise<void>;
}

const DivisionDialog = ({
  open,
  onClose,
  divisionForm,
  setDivisionForm,
  isEditing,
  handleSubmitDivision,
}: DivisionDialogProps) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Division" : "Add Division"}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="division-name">Division Name *</Label>
          <Input
            id="division-name"
            value={divisionForm.name}
            onChange={(e) =>
              setDivisionForm({ ...divisionForm, name: e.target.value })
            }
            placeholder="Engineering"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="division-code">Division Code</Label>
          <Input
            id="division-code"
            value={divisionForm.code}
            onChange={(e) =>
              setDivisionForm({ ...divisionForm, code: e.target.value })
            }
            placeholder="ENG"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="division-description">Description</Label>
          <Input
            id="division-description"
            value={divisionForm.description}
            onChange={(e) =>
              setDivisionForm({ ...divisionForm, description: e.target.value })
            }
            placeholder="Software development and IT operations"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmitDivision}>
          {isEditing ? "Update" : "Add"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Employment Status Dialog Component
interface StatusDialogProps {
  open: boolean;
  onClose: () => void;
  statusForm: { name: string; code: string; description: string };
  setStatusForm: React.Dispatch<
    React.SetStateAction<{ name: string; code: string; description: string }>
  >;
  isEditing: boolean;
  handleSubmitStatus: () => Promise<void>;
}

const StatusDialog = ({
  open,
  onClose,
  statusForm,
  setStatusForm,
  isEditing,
  handleSubmitStatus,
}: StatusDialogProps) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Employment Status" : "Add Employment Status"}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="status-name">Status Name *</Label>
          <Input
            id="status-name"
            value={statusForm.name}
            onChange={(e) =>
              setStatusForm({ ...statusForm, name: e.target.value })
            }
            placeholder="Permanent"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status-code">Status Code</Label>
          <Input
            id="status-code"
            value={statusForm.code}
            onChange={(e) =>
              setStatusForm({ ...statusForm, code: e.target.value })
            }
            placeholder="PERM"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status-description">Description</Label>
          <Input
            id="status-description"
            value={statusForm.description}
            onChange={(e) =>
              setStatusForm({ ...statusForm, description: e.target.value })
            }
            placeholder="Full-time permanent employee"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmitStatus}>
          {isEditing ? "Update" : "Add"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const SettingsPage = () => {
  const [language, setLanguage] = useState("id"); // Default to Indonesian
  const { toast } = useToast();

  // State for organization settings
  const [cities, setCities] = useState<any[]>([]);
  const [workAreas, setWorkAreas] = useState<any[]>([]);
  const [workPlaces, setWorkPlaces] = useState<any[]>([]);
  const [filteredWorkAreas, setFilteredWorkAreas] = useState<any[]>([]);
  const [filteredWorkPlaces, setFilteredWorkPlaces] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [employmentStatuses, setEmploymentStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [showCityDialog, setShowCityDialog] = useState(false);
  const [showWorkAreaDialog, setShowWorkAreaDialog] = useState(false);
  const [showWorkPlaceDialog, setShowWorkPlaceDialog] = useState(false);
  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [showDivisionDialog, setShowDivisionDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);

  // Form states
  const [cityForm, setCityForm] = useState({
    name: "",
  });
  const [workAreaForm, setWorkAreaForm] = useState({
    name: "",
    city_id: "",
  });
  const [workPlaceForm, setWorkPlaceForm] = useState({
    name: "",
    work_area_id: "",
  });
  const [branchForm, setBranchForm] = useState({
    name: "",
    code: "",
    address: "",
    city_id: "",
    work_area_id: "",
    work_place_id: "",
  });
  const [divisionForm, setDivisionForm] = useState({
    name: "",
    code: "",
    description: "",
  });
  const [statusForm, setStatusForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  // Fetch data from Supabase
  const fetchOrganizationData = async () => {
    setLoading(true);
    try {
      // Fetch cities
      const { data: cityData, error: cityError } = await supabase
        .from("cities")
        .select("*")
        .order("name");

      if (cityError) throw cityError;
      setCities(cityData || []);

      // Fetch work areas
      const { data: workAreaData, error: workAreaError } = await supabase
        .from("work_areas")
        .select("*, cities!inner(name)")
        .order("name");

      if (workAreaError) throw workAreaError;
      setWorkAreas(workAreaData || []);

      // Fetch work places
      const { data: workPlaceData, error: workPlaceError } = await supabase
        .from("work_places")
        .select("*, work_areas!inner(name, city_id, cities!inner(name))")
        .order("name");

      if (workPlaceError) throw workPlaceError;
      setWorkPlaces(workPlaceData || []);

      // Fetch branches
      const { data: branchData, error: branchError } = await supabase
        .from("branches")
        .select(
          "*, work_places!inner(name, work_area_id, work_areas!inner(name, city_id, cities!inner(name)))",
        )
        .order("name");

      if (branchError) throw branchError;
      setBranches(branchData || []);

      // Fetch divisions
      const { data: divisionData, error: divisionError } = await supabase
        .from("divisions")
        .select("*")
        .order("name");

      if (divisionError) throw divisionError;
      setDivisions(divisionData || []);

      // Fetch employment statuses
      const { data: statusData, error: statusError } = await supabase
        .from("employment_statuses")
        .select("*")
        .order("name");

      if (statusError) throw statusError;
      setEmploymentStatuses(statusData || []);
    } catch (error: any) {
      console.error("Error fetching organization data:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizationData();

    // Set up realtime subscriptions
    const citySubscription = supabase
      .channel("cities-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cities" },
        fetchOrganizationData,
      )
      .subscribe();

    const workAreaSubscription = supabase
      .channel("work-areas-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "work_areas" },
        fetchOrganizationData,
      )
      .subscribe();

    const workPlaceSubscription = supabase
      .channel("work-places-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "work_places" },
        fetchOrganizationData,
      )
      .subscribe();

    const branchSubscription = supabase
      .channel("branches-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "branches" },
        fetchOrganizationData,
      )
      .subscribe();

    const divisionSubscription = supabase
      .channel("divisions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "divisions" },
        fetchOrganizationData,
      )
      .subscribe();

    const statusSubscription = supabase
      .channel("statuses-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "employment_statuses" },
        fetchOrganizationData,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(citySubscription);
      supabase.removeChannel(workAreaSubscription);
      supabase.removeChannel(workPlaceSubscription);
      supabase.removeChannel(branchSubscription);
      supabase.removeChannel(divisionSubscription);
      supabase.removeChannel(statusSubscription);
    };
  }, []);

  // City handlers
  const handleAddCity = () => {
    setIsEditing(false);
    setCurrentItem(null);
    setCityForm({ name: "" });
    setShowCityDialog(true);
  };

  const handleEditCity = (city: any) => {
    setIsEditing(true);
    setCurrentItem(city);
    setCityForm({
      name: city.name,
    });
    setShowCityDialog(true);
  };

  const handleDeleteCity = async (id: string) => {
    if (!confirm("Are you sure you want to delete this city?")) return;

    try {
      const { error } = await supabase.from("cities").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "City deleted successfully",
      });

      fetchOrganizationData();
    } catch (error: any) {
      console.error("Error deleting city:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmitCity = async () => {
    try {
      if (!cityForm.name) {
        toast({
          title: "Error",
          description: "City name is required",
          variant: "destructive",
        });
        return;
      }

      if (isEditing && currentItem) {
        const { error } = await supabase
          .from("cities")
          .update({
            name: cityForm.name,
          })
          .eq("id", currentItem.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "City updated successfully",
        });
      } else {
        const { error } = await supabase.from("cities").insert({
          name: cityForm.name,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "City added successfully",
        });
      }

      setShowCityDialog(false);
      fetchOrganizationData();
    } catch (error: any) {
      console.error("Error saving city:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Work Area handlers
  const handleAddWorkArea = () => {
    setIsEditing(false);
    setCurrentItem(null);
    setWorkAreaForm({ name: "", city_id: "" });
    setShowWorkAreaDialog(true);
  };

  const handleEditWorkArea = (workArea: any) => {
    setIsEditing(true);
    setCurrentItem(workArea);
    setWorkAreaForm({
      name: workArea.name,
      city_id: workArea.city_id,
    });
    setShowWorkAreaDialog(true);
  };

  const handleDeleteWorkArea = async (id: string) => {
    if (!confirm("Are you sure you want to delete this work area?")) return;

    try {
      const { error } = await supabase.from("work_areas").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Work area deleted successfully",
      });

      fetchOrganizationData();
    } catch (error: any) {
      console.error("Error deleting work area:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmitWorkArea = async () => {
    try {
      if (!workAreaForm.name) {
        toast({
          title: "Error",
          description: "Work area name is required",
          variant: "destructive",
        });
        return;
      }

      if (!workAreaForm.city_id) {
        toast({
          title: "Error",
          description: "City is required",
          variant: "destructive",
        });
        return;
      }

      if (isEditing && currentItem) {
        const { error } = await supabase
          .from("work_areas")
          .update({
            name: workAreaForm.name,
            city_id: workAreaForm.city_id,
          })
          .eq("id", currentItem.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Work area updated successfully",
        });
      } else {
        const { error } = await supabase.from("work_areas").insert({
          name: workAreaForm.name,
          city_id: workAreaForm.city_id,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Work area added successfully",
        });
      }

      setShowWorkAreaDialog(false);
      fetchOrganizationData();
    } catch (error: any) {
      console.error("Error saving work area:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Work Place handlers
  const handleAddWorkPlace = () => {
    setIsEditing(false);
    setCurrentItem(null);
    setWorkPlaceForm({ name: "", work_area_id: "" });
    setShowWorkPlaceDialog(true);
  };

  const handleEditWorkPlace = (workPlace: any) => {
    setIsEditing(true);
    setCurrentItem(workPlace);
    setWorkPlaceForm({
      name: workPlace.name,
      work_area_id: workPlace.work_area_id,
    });
    setShowWorkPlaceDialog(true);
  };

  const handleDeleteWorkPlace = async (id: string) => {
    if (!confirm("Are you sure you want to delete this work place?")) return;

    try {
      const { error } = await supabase
        .from("work_places")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Work place deleted successfully",
      });

      fetchOrganizationData();
    } catch (error: any) {
      console.error("Error deleting work place:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmitWorkPlace = async () => {
    try {
      if (!workPlaceForm.name) {
        toast({
          title: "Error",
          description: "Work place name is required",
          variant: "destructive",
        });
        return;
      }

      if (!workPlaceForm.work_area_id) {
        toast({
          title: "Error",
          description: "Work area is required",
          variant: "destructive",
        });
        return;
      }

      if (isEditing && currentItem) {
        const { error } = await supabase
          .from("work_places")
          .update({
            name: workPlaceForm.name,
            work_area_id: workPlaceForm.work_area_id,
          })
          .eq("id", currentItem.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Work place updated successfully",
        });
      } else {
        const { error } = await supabase.from("work_places").insert({
          name: workPlaceForm.name,
          work_area_id: workPlaceForm.work_area_id,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Work place added successfully",
        });
      }

      setShowWorkPlaceDialog(false);
      fetchOrganizationData();
    } catch (error: any) {
      console.error("Error saving work place:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Branch handlers
  const handleAddBranch = () => {
    setIsEditing(false);
    setCurrentItem(null);
    setBranchForm({
      name: "",
      code: "",
      address: "",
      city_id: "",
      work_area_id: "",
      work_place_id: "",
    });
    setFilteredWorkAreas([]);
    setFilteredWorkPlaces([]);
    setShowBranchDialog(true);
  };

  const handleEditBranch = (branch: any) => {
    setIsEditing(true);
    setCurrentItem(branch);

    // Extract work_place data
    const workPlace = branch.work_places || {};
    const workArea = workPlace.work_areas || {};
    const city = workArea.cities || {};

    setBranchForm({
      name: branch.name,
      code: branch.code || "",
      address: branch.address || "",
      city_id: workArea.city_id || "",
      work_area_id: workPlace.work_area_id || "",
      work_place_id: branch.work_place_id || "",
    });

    // Filter work areas and work places based on selected city and work area
    if (workArea.city_id) {
      handleCityChange(workArea.city_id);
    }
    if (workPlace.work_area_id) {
      handleWorkAreaChange(workPlace.work_area_id);
    }

    setShowBranchDialog(true);
  };

  const handleDeleteBranch = async (id: string) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;

    try {
      const { error } = await supabase.from("branches").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Branch deleted successfully",
      });

      fetchOrganizationData();
    } catch (error: any) {
      console.error("Error deleting branch:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handlers for cascading dropdowns
  const handleCityChange = (cityId: string) => {
    const filtered = workAreas.filter((area) => area.city_id === cityId);
    setFilteredWorkAreas(filtered);
    setFilteredWorkPlaces([]);
  };

  const handleWorkAreaChange = (workAreaId: string) => {
    const filtered = workPlaces.filter(
      (place) => place.work_area_id === workAreaId,
    );
    setFilteredWorkPlaces(filtered);
  };

  const handleSubmitBranch = async () => {
    try {
      if (!branchForm.name) {
        toast({
          title: "Error",
          description: "Branch name is required",
          variant: "destructive",
        });
        return;
      }

      if (!branchForm.work_place_id) {
        toast({
          title: "Error",
          description: "Work place is required",
          variant: "destructive",
        });
        return;
      }

      if (isEditing && currentItem) {
        const { error } = await supabase
          .from("branches")
          .update({
            name: branchForm.name,
            code: branchForm.code,
            address: branchForm.address,
            work_place_id: branchForm.work_place_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentItem.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Branch updated successfully",
        });
      } else {
        const { error } = await supabase.from("branches").insert({
          name: branchForm.name,
          code: branchForm.code,
          address: branchForm.address,
          work_place_id: branchForm.work_place_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Branch added successfully",
        });
      }

      setShowBranchDialog(false);
      fetchOrganizationData();
    } catch (error: any) {
      console.error("Error saving branch:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Division handlers
  const handleAddDivision = () => {
    setIsEditing(false);
    setCurrentItem(null);
    setDivisionForm({ name: "", code: "", description: "" });
    setShowDivisionDialog(true);
  };

  const handleEditDivision = (division: any) => {
    setIsEditing(true);
    setCurrentItem(division);
    setDivisionForm({
      name: division.name,
      code: division.code || "",
      description: division.description || "",
    });
    setShowDivisionDialog(true);
  };

  const handleDeleteDivision = async (id: string) => {
    if (!confirm("Are you sure you want to delete this division?")) return;

    try {
      const { error } = await supabase.from("divisions").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Division deleted successfully",
      });

      fetchOrganizationData();
    } catch (error: any) {
      console.error("Error deleting division:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmitDivision = async () => {
    try {
      if (!divisionForm.name) {
        toast({
          title: "Error",
          description: "Division name is required",
          variant: "destructive",
        });
        return;
      }

      if (isEditing && currentItem) {
        const { error } = await supabase
          .from("divisions")
          .update({
            name: divisionForm.name,
            code: divisionForm.code,
            description: divisionForm.description,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentItem.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Division updated successfully",
        });
      } else {
        const { error } = await supabase.from("divisions").insert({
          name: divisionForm.name,
          code: divisionForm.code,
          description: divisionForm.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Division added successfully",
        });
      }

      setShowDivisionDialog(false);
      fetchOrganizationData();
    } catch (error: any) {
      console.error("Error saving division:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Employment Status handlers
  const handleAddStatus = () => {
    setIsEditing(false);
    setCurrentItem(null);
    setStatusForm({ name: "", code: "", description: "" });
    setShowStatusDialog(true);
  };

  const handleEditStatus = (status: any) => {
    setIsEditing(true);
    setCurrentItem(status);
    setStatusForm({
      name: status.name,
      code: status.code || "",
      description: status.description || "",
    });
    setShowStatusDialog(true);
  };

  const handleDeleteStatus = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employment status?"))
      return;

    try {
      const { error } = await supabase
        .from("employment_statuses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employment status deleted successfully",
      });

      fetchOrganizationData();
    } catch (error: any) {
      console.error("Error deleting employment status:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmitStatus = async () => {
    try {
      if (!statusForm.name) {
        toast({
          title: "Error",
          description: "Status name is required",
          variant: "destructive",
        });
        return;
      }

      if (isEditing && currentItem) {
        const { error } = await supabase
          .from("employment_statuses")
          .update({
            name: statusForm.name,
            code: statusForm.code,
            description: statusForm.description,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentItem.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Employment status updated successfully",
        });
      } else {
        const { error } = await supabase.from("employment_statuses").insert({
          name: statusForm.name,
          code: statusForm.code,
          description: statusForm.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Employment status added successfully",
        });
      }

      setShowStatusDialog(false);
      fetchOrganizationData();
    } catch (error: any) {
      console.error("Error saving employment status:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    toast({
      title: value === "id" ? "Bahasa diubah" : "Language changed",
      description:
        value === "id"
          ? "Bahasa telah diubah ke Bahasa Indonesia"
          : "Language has been changed to English",
      duration: 3000,
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: language === "id" ? "Pengaturan disimpan" : "Settings saved",
      description:
        language === "id"
          ? "Pengaturan Anda telah berhasil disimpan"
          : "Your settings have been successfully saved",
      duration: 3000,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {language === "id" ? "Pengaturan" : "Settings"}
          </h1>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {language === "id" ? "Umum" : "General"}
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {language === "id" ? "Akun" : "Account"}
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                {language === "id" ? "Notifikasi" : "Notifications"}
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {language === "id" ? "Keamanan" : "Security"}
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                {language === "id" ? "Sistem" : "System"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "id"
                      ? "Pengaturan Bahasa"
                      : "Language Settings"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="language">
                      {language === "id" ? "Pilih Bahasa" : "Select Language"}
                    </Label>
                    <RadioGroup
                      id="language"
                      value={language}
                      onValueChange={handleLanguageChange}
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="id" id="id" />
                        <Label
                          htmlFor="id"
                          className="font-normal cursor-pointer"
                        >
                          Bahasa Indonesia
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="en" id="en" />
                        <Label
                          htmlFor="en"
                          className="font-normal cursor-pointer"
                        >
                          English
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="timezone">
                      {language === "id" ? "Zona Waktu" : "Timezone"}
                    </Label>
                    <div className="text-sm text-gray-500">
                      {language === "id"
                        ? "Asia/Jakarta (GMT+7)"
                        : "Asia/Jakarta (GMT+7)"}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="default" onClick={handleSaveSettings}>
                      {language === "id"
                        ? "Simpan Pengaturan"
                        : "Save Settings"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center p-8 border border-dashed rounded-md">
                    <h3 className="text-lg font-medium mb-2">
                      {language === "id"
                        ? "Pengaturan Akun"
                        : "Account Settings"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {language === "id"
                        ? "Kelola profil dan preferensi akun Anda"
                        : "Manage your profile and account preferences"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {language === "id"
                        ? "Modul ini akan diimplementasikan segera"
                        : "This module will be implemented soon"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center p-8 border border-dashed rounded-md">
                    <h3 className="text-lg font-medium mb-2">
                      {language === "id"
                        ? "Pengaturan Notifikasi"
                        : "Notification Settings"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {language === "id"
                        ? "Kelola preferensi notifikasi Anda"
                        : "Manage your notification preferences"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {language === "id"
                        ? "Modul ini akan diimplementasikan segera"
                        : "This module will be implemented soon"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center p-8 border border-dashed rounded-md">
                    <h3 className="text-lg font-medium mb-2">
                      {language === "id"
                        ? "Pengaturan Keamanan"
                        : "Security Settings"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {language === "id"
                        ? "Kelola kata sandi dan pengaturan keamanan"
                        : "Manage passwords and security settings"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {language === "id"
                        ? "Modul ini akan diimplementasikan segera"
                        : "This module will be implemented soon"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system">
              <div className="space-y-6">
                {/* City Management */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>
                      {language === "id" ? "Manajemen Kota" : "City Management"}
                    </CardTitle>
                    <Button onClick={handleAddCity} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      {language === "id" ? "Tambah Kota" : "Add City"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-4">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : cities.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        {language === "id"
                          ? "Tidak ada kota"
                          : "No cities found"}
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              {language === "id" ? "Nama" : "Name"}
                            </TableHead>
                            <TableHead className="text-right">
                              {language === "id" ? "Aksi" : "Actions"}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cities.map((city) => (
                            <TableRow key={city.id}>
                              <TableCell className="font-medium">
                                {city.name}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <span className="sr-only">Open menu</span>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleEditCity(city)}
                                    >
                                      <Pencil className="mr-2 h-4 w-4" />
                                      {language === "id" ? "Edit" : "Edit"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteCity(city.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {language === "id" ? "Hapus" : "Delete"}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Work Area Management */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>
                      {language === "id"
                        ? "Manajemen Area Kerja"
                        : "Work Area Management"}
                    </CardTitle>
                    <Button onClick={handleAddWorkArea} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      {language === "id" ? "Tambah Area" : "Add Work Area"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-4">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : workAreas.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        {language === "id"
                          ? "Tidak ada area kerja"
                          : "No work areas found"}
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              {language === "id" ? "Nama" : "Name"}
                            </TableHead>
                            <TableHead>
                              {language === "id" ? "Kota" : "City"}
                            </TableHead>
                            <TableHead className="text-right">
                              {language === "id" ? "Aksi" : "Actions"}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workAreas.map((workArea) => (
                            <TableRow key={workArea.id}>
                              <TableCell className="font-medium">
                                {workArea.name}
                              </TableCell>
                              <TableCell>
                                {workArea.cities?.name || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <span className="sr-only">Open menu</span>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleEditWorkArea(workArea)
                                      }
                                    >
                                      <Pencil className="mr-2 h-4 w-4" />
                                      {language === "id" ? "Edit" : "Edit"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteWorkArea(workArea.id)
                                      }
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {language === "id" ? "Hapus" : "Delete"}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Work Place Management */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>
                      {language === "id"
                        ? "Manajemen Tempat Kerja"
                        : "Work Place Management"}
                    </CardTitle>
                    <Button onClick={handleAddWorkPlace} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      {language === "id" ? "Tambah Tempat" : "Add Work Place"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-4">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : workPlaces.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        {language === "id"
                          ? "Tidak ada tempat kerja"
                          : "No work places found"}
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              {language === "id" ? "Nama" : "Name"}
                            </TableHead>
                            <TableHead>
                              {language === "id" ? "Area Kerja" : "Work Area"}
                            </TableHead>
                            <TableHead>
                              {language === "id" ? "Kota" : "City"}
                            </TableHead>
                            <TableHead className="text-right">
                              {language === "id" ? "Aksi" : "Actions"}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workPlaces.map((workPlace) => (
                            <TableRow key={workPlace.id}>
                              <TableCell className="font-medium">
                                {workPlace.name}
                              </TableCell>
                              <TableCell>
                                {workPlace.work_areas?.name || "-"}
                              </TableCell>
                              <TableCell>
                                {workPlace.work_areas?.cities?.name || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <span className="sr-only">Open menu</span>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleEditWorkPlace(workPlace)
                                      }
                                    >
                                      <Pencil className="mr-2 h-4 w-4" />
                                      {language === "id" ? "Edit" : "Edit"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteWorkPlace(workPlace.id)
                                      }
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {language === "id" ? "Hapus" : "Delete"}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Branch Management */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>
                      {language === "id"
                        ? "Manajemen Cabang"
                        : "Branch Management"}
                    </CardTitle>
                    <Button onClick={handleAddBranch} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      {language === "id" ? "Tambah Cabang" : "Add Branch"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-4">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : branches.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        {language === "id"
                          ? "Tidak ada cabang"
                          : "No branches found"}
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              {language === "id" ? "Nama" : "Name"}
                            </TableHead>
                            <TableHead>
                              {language === "id" ? "Kode" : "Code"}
                            </TableHead>
                            <TableHead>
                              {language === "id" ? "Alamat" : "Address"}
                            </TableHead>
                            <TableHead>
                              {language === "id"
                                ? "Tempat Kerja"
                                : "Work Place"}
                            </TableHead>
                            <TableHead>
                              {language === "id" ? "Area" : "Area"}
                            </TableHead>
                            <TableHead>
                              {language === "id" ? "Kota" : "City"}
                            </TableHead>
                            <TableHead className="text-right">
                              {language === "id" ? "Aksi" : "Actions"}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {branches.map((branch) => (
                            <TableRow key={branch.id}>
                              <TableCell className="font-medium">
                                {branch.name}
                              </TableCell>
                              <TableCell>{branch.code || "-"}</TableCell>
                              <TableCell>{branch.address || "-"}</TableCell>
                              <TableCell>
                                {branch.work_places?.name || "-"}
                              </TableCell>
                              <TableCell>
                                {branch.work_places?.work_areas?.name || "-"}
                              </TableCell>
                              <TableCell>
                                {branch.work_places?.work_areas?.cities?.name ||
                                  "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <span className="sr-only">Open menu</span>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleEditBranch(branch)}
                                    >
                                      <Pencil className="mr-2 h-4 w-4" />
                                      {language === "id" ? "Edit" : "Edit"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteBranch(branch.id)
                                      }
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {language === "id" ? "Hapus" : "Delete"}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Division Management */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>
                      {language === "id"
                        ? "Manajemen Divisi"
                        : "Division Management"}
                    </CardTitle>
                    <Button onClick={handleAddDivision} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      {language === "id" ? "Tambah Divisi" : "Add Division"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-4">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : divisions.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        {language === "id"
                          ? "Tidak ada divisi"
                          : "No divisions found"}
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              {language === "id" ? "Nama" : "Name"}
                            </TableHead>
                            <TableHead>
                              {language === "id" ? "Kode" : "Code"}
                            </TableHead>
                            <TableHead>
                              {language === "id" ? "Deskripsi" : "Description"}
                            </TableHead>
                            <TableHead className="text-right">
                              {language === "id" ? "Aksi" : "Actions"}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {divisions.map((division) => (
                            <TableRow key={division.id}>
                              <TableCell className="font-medium">
                                {division.name}
                              </TableCell>
                              <TableCell>{division.code || "-"}</TableCell>
                              <TableCell>
                                {division.description || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <span className="sr-only">Open menu</span>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleEditDivision(division)
                                      }
                                    >
                                      <Pencil className="mr-2 h-4 w-4" />
                                      {language === "id" ? "Edit" : "Edit"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteDivision(division.id)
                                      }
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {language === "id" ? "Hapus" : "Delete"}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Employment Status Management */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>
                      {language === "id"
                        ? "Status Kepegawaian"
                        : "Employment Status"}
                    </CardTitle>
                    <Button onClick={handleAddStatus} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      {language === "id" ? "Tambah Status" : "Add Status"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-4">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : employmentStatuses.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        {language === "id"
                          ? "Tidak ada status"
                          : "No statuses found"}
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              {language === "id" ? "Nama" : "Name"}
                            </TableHead>
                            <TableHead>
                              {language === "id" ? "Kode" : "Code"}
                            </TableHead>
                            <TableHead>
                              {language === "id" ? "Deskripsi" : "Description"}
                            </TableHead>
                            <TableHead className="text-right">
                              {language === "id" ? "Aksi" : "Actions"}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {employmentStatuses.map((status) => (
                            <TableRow key={status.id}>
                              <TableCell className="font-medium">
                                {status.name}
                              </TableCell>
                              <TableCell>{status.code || "-"}</TableCell>
                              <TableCell>{status.description || "-"}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <span className="sr-only">Open menu</span>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleEditStatus(status)}
                                    >
                                      <Pencil className="mr-2 h-4 w-4" />
                                      {language === "id" ? "Edit" : "Edit"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteStatus(status.id)
                                      }
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {language === "id" ? "Hapus" : "Delete"}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialogs */}
      {showCityDialog && (
        <CityDialog
          open={showCityDialog}
          onClose={() => setShowCityDialog(false)}
          cityForm={cityForm}
          setCityForm={setCityForm}
          isEditing={isEditing}
          handleSubmitCity={handleSubmitCity}
        />
      )}

      {showWorkAreaDialog && (
        <WorkAreaDialog
          open={showWorkAreaDialog}
          onClose={() => setShowWorkAreaDialog(false)}
          workAreaForm={workAreaForm}
          setWorkAreaForm={setWorkAreaForm}
          isEditing={isEditing}
          cities={cities}
          handleSubmitWorkArea={handleSubmitWorkArea}
        />
      )}

      {showWorkPlaceDialog && (
        <WorkPlaceDialog
          open={showWorkPlaceDialog}
          onClose={() => setShowWorkPlaceDialog(false)}
          workPlaceForm={workPlaceForm}
          setWorkPlaceForm={setWorkPlaceForm}
          isEditing={isEditing}
          workAreas={workAreas}
          handleSubmitWorkPlace={handleSubmitWorkPlace}
        />
      )}

      {showBranchDialog && (
        <BranchDialog
          open={showBranchDialog}
          onClose={() => setShowBranchDialog(false)}
          branchForm={branchForm}
          setBranchForm={setBranchForm}
          isEditing={isEditing}
          cities={cities}
          workAreas={
            filteredWorkAreas.length > 0 ? filteredWorkAreas : workAreas
          }
          workPlaces={
            filteredWorkPlaces.length > 0 ? filteredWorkPlaces : workPlaces
          }
          handleSubmitBranch={handleSubmitBranch}
          handleCityChange={handleCityChange}
          handleWorkAreaChange={handleWorkAreaChange}
        />
      )}

      {showDivisionDialog && (
        <DivisionDialog
          open={showDivisionDialog}
          onClose={() => setShowDivisionDialog(false)}
          divisionForm={divisionForm}
          setDivisionForm={setDivisionForm}
          isEditing={isEditing}
          handleSubmitDivision={handleSubmitDivision}
        />
      )}

      {showStatusDialog && (
        <StatusDialog
          open={showStatusDialog}
          onClose={() => setShowStatusDialog(false)}
          statusForm={statusForm}
          setStatusForm={setStatusForm}
          isEditing={isEditing}
          handleSubmitStatus={handleSubmitStatus}
        />
      )}
    </DashboardLayout>
  );
};

export default SettingsPage;
