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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  UserPlus,
  Shield,
  Settings,
  MoreHorizontal,
} from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "inactive";
}

interface FreelanceRoleManagementProps {
  onChangeRole?: (userId: string, roleId: string) => void;
  onViewRoleList?: (roleId: string) => void;
}

const FreelanceRoleManagement = ({
  onChangeRole = (userId: string, roleId: string) => {
    console.log(`Changed user ${userId} to role ${roleId}`);
    alert(`User role has been updated successfully`);
  },
  onViewRoleList = (roleId: string) => {
    console.log(`Viewing users with role ${roleId}`);
    alert(`Displaying users with selected role`);
  },
}: FreelanceRoleManagementProps) => {
  const [activeTab, setActiveTab] = useState("roles");
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRoleId, setNewRoleId] = useState("");

  // Mock data for roles
  const roles: Role[] = [
    {
      id: "1",
      name: "Admin",
      description: "Full system access with all permissions",
      permissions: [
        "manage_users",
        "manage_roles",
        "approve_payments",
        "view_reports",
        "manage_projects",
      ],
      userCount: 3,
    },
    {
      id: "2",
      name: "Supervisor",
      description: "Can manage freelancers and approve work",
      permissions: [
        "view_users",
        "approve_work",
        "view_reports",
        "manage_projects",
      ],
      userCount: 8,
    },
    {
      id: "3",
      name: "Freelancer",
      description: "Limited access to own projects and payments",
      permissions: ["view_own_projects", "submit_work", "view_own_payments"],
      userCount: 42,
    },
    {
      id: "4",
      name: "Finance",
      description: "Access to payment and financial reports",
      permissions: ["view_payments", "process_payments", "view_reports"],
      userCount: 5,
    },
    {
      id: "5",
      name: "HR",
      description: "Access to user management and onboarding",
      permissions: ["view_users", "manage_onboarding", "view_reports"],
      userCount: 4,
    },
  ];

  // Mock data for users
  const users: User[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Admin",
      department: "Management",
      status: "active",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Supervisor",
      department: "Development",
      status: "active",
    },
    {
      id: "3",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      role: "Freelancer",
      department: "Design",
      status: "active",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "Finance",
      department: "Finance",
      status: "active",
    },
    {
      id: "5",
      name: "Michael Wilson",
      email: "michael.wilson@example.com",
      role: "HR",
      department: "Human Resources",
      status: "active",
    },
    {
      id: "6",
      name: "Sarah Brown",
      email: "sarah.brown@example.com",
      role: "Freelancer",
      department: "Content",
      status: "inactive",
    },
  ];

  const handleChangeRole = (user: User) => {
    setSelectedUser(user);
    setNewRoleId("");
    setChangeRoleDialogOpen(true);
  };

  const confirmRoleChange = () => {
    if (selectedUser && newRoleId) {
      onChangeRole(selectedUser.id, newRoleId);
      setChangeRoleDialogOpen(false);
    }
  };

  const handleViewRoleList = (roleId: string) => {
    onViewRoleList(roleId);
    setActiveTab("users");
  };

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl font-bold">
            Role Management System
          </CardTitle>
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <Tabs
          defaultValue="roles"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="roles">
              <Shield className="mr-2 h-4 w-4" />
              Roles & Permissions
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              Users by Role
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="mt-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 2).map((permission) => (
                            <Badge
                              key={permission}
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {permission.replace("_", " ")}
                            </Badge>
                          ))}
                          {role.permissions.length > 2 && (
                            <Badge
                              variant="outline"
                              className="bg-gray-50 text-gray-700 border-gray-200"
                            >
                              +{role.permissions.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto font-normal"
                          onClick={() => handleViewRoleList(role.id)}
                        >
                          {role.userCount} users
                        </Button>
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
                              onClick={() => handleViewRoleList(role.id)}
                            >
                              <Users className="mr-2 h-4 w-4" />
                              View Users
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Edit Permissions
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-0">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="filter-role">Filter by Role</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="filter-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="search-users">Search Users</Label>
                <Input
                  id="search-users"
                  placeholder="Search by name or email"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.status === "active"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChangeRole(user)}
                        >
                          Change Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Change Role Dialog */}
        <Dialog
          open={changeRoleDialogOpen}
          onOpenChange={setChangeRoleDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>
                Update the role for {selectedUser?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="current-role" className="text-right">
                  Current Role
                </Label>
                <div className="col-span-3">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {selectedUser?.role}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-role" className="text-right">
                  New Role
                </Label>
                <div className="col-span-3">
                  <Select value={newRoleId} onValueChange={setNewRoleId}>
                    <SelectTrigger id="new-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notify-user" />
                    <Label htmlFor="notify-user">
                      Notify user about role change
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setChangeRoleDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={confirmRoleChange} disabled={!newRoleId}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default FreelanceRoleManagement;
