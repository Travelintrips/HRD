export interface City {
  id: string;
  name: string;
  created_at: string;
}

export interface WorkArea {
  id: string;
  city_id: string;
  name: string;
  created_at: string;
  city_name?: string; // Joined field
}

export interface WorkPlace {
  id: string;
  work_area_id: string;
  name: string;
  created_at: string;
  work_area_name?: string; // Joined field
  city_name?: string; // Joined field
}

export interface Branch {
  id: string;
  name: string;
  code?: string;
  work_place_id?: string;
  created_at: string;
  updated_at: string;
  work_place_name?: string; // Joined field
  work_area_name?: string; // Joined field
  city_name?: string; // Joined field
}

export interface Employee {
  id: string;
  name: string;
  employee_id: string;
  branch: string;
  division: string;
  status: "permanent" | "freelance";
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Shift {
  id: string;
  name: string;
  branch: string;
  start_time: string;
  end_time: string;
  date: string;
  capacity: number;
  status: "open" | "full" | "closed";
  created_at: string;
  updated_at: string;
  assigned_employees?: Employee[];
}

export interface ShiftAssignment {
  id: string;
  employee_id: string;
  shift_id: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: "present" | "absent" | "late" | "leave";
  location_check_in?: any;
  location_check_out?: any;
  selfie_check_in?: string;
  selfie_check_out?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  employee_name?: string; // Joined field
}

export interface FreelanceProject {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "ongoing" | "completed" | "rejected";
  deadline: string;
  payment_type: "project" | "hourly";
  budget: string;
  assigned_to?: string;
  rating: number;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface FreelancePayment {
  id: string;
  project_id: string;
  freelancer_id: string;
  amount: number;
  status: "pending" | "approved" | "paid" | "rejected";
  payment_type: "project" | "hourly";
  hours?: number;
  rate?: number;
  date: string;
  rating: number;
  bonus_amount?: number;
  created_at: string;
  updated_at: string;
  project_title?: string; // Joined field
  freelancer_name?: string; // Joined field
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
  user_count?: number; // Calculated field
}

export interface UserRoleAssignment {
  id: string;
  user_id: string;
  role_id: string;
  created_at: string;
}

export interface FreelanceShift {
  id: string;
  name: string;
  branch: string;
  start_time: string;
  end_time: string;
  date: string;
  capacity: number;
  status: "open" | "full" | "closed";
  created_at: string;
  updated_at: string;
  assigned_freelancers?: string[]; // Joined field
}

export interface FreelanceShiftAssignment {
  id: string;
  freelancer_id: string;
  shift_id: string;
  created_at: string;
}

export interface GeofenceLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  created_at: string;
  updated_at: string;
  assigned_employees?: string[]; // Array of employee IDs assigned to this location
}

export interface EmployeeLocationAssignment {
  id: string;
  employee_id: string;
  location_id: string;
  created_at: string;
}
