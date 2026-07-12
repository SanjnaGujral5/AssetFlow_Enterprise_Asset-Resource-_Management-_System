export type Role = "EMPLOYEE" | "DEPT_HEAD" | "ASSET_MANAGER" | "ADMIN";

export type AssetStatus =
  | "AVAILABLE"
  | "ALLOCATED"
  | "RESERVED"
  | "UNDER_MAINTENANCE"
  | "LOST"
  | "RETIRED"
  | "DISPOSED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "INACTIVE";
  departmentId: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Department {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  headUserId: string | null;
  headUser: UserSummary | null;
  parentDepartmentId: string | null;
  parentDepartment: { id: string; name: string } | null;
  _count?: { employees: number };
  createdAt: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  customFieldsSchema: unknown;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  categoryId: string;
  category: AssetCategory;
  serialNumber: string | null;
  acquisitionDate: string | null;
  acquisitionCost: number | null;
  condition: string | null;
  location: string | null;
  photoUrl: string | null;
  isBookable: boolean;
  status: AssetStatus;
  currentHolderUserId: string | null;
  currentHolderDeptId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateAssetInput {
  name: string;
  assetTag: string;
  categoryId: string;
  serialNumber?: string;
  acquisitionDate?: string;
  acquisitionCost?: number;
  condition?: string;
  location?: string;
  photoUrl?: string;
  isBookable?: boolean;
}

// --- Allocation & Transfer ---

export type AllocationStatus = "ACTIVE" | "RETURNED" | "OVERDUE";

export type TransferStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Allocation {
  id: string;
  assetId: string;
  asset: Asset;
  holderUserId: string | null;
  holderUser: UserSummary | null;
  holderDeptId: string | null;
  allocatedAt: string;
  expectedReturnDate: string | null;
  actualReturnDate: string | null;
  returnConditionNotes: string | null;
  status: AllocationStatus;
}

export interface TransferRequest {
  id: string;
  assetId: string;
  asset: Asset;
  fromUserId: string | null;
  fromUser: UserSummary | null;
  toUserId: string;
  toUser: UserSummary;
  requestedById: string;
  requestedBy: UserSummary;
  status: TransferStatus;
  approvedById: string | null;
  createdAt: string;
}

// --- Booking ---

export type BookingStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

export interface Booking {
  id: string;
  resourceAssetId: string;
  resourceAsset: Asset;
  bookedById: string;
  bookedBy: UserSummary;
  departmentId: string | null;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
}

// --- Maintenance ---

export type MaintenanceStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "TECHNICIAN_ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED";

export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  asset: Asset;
  raisedById: string;
  raisedBy: UserSummary;
  issueDescription: string;
  priority: Priority;
  photoUrl: string | null;
  status: MaintenanceStatus;
  approvedById: string | null;
  technicianName: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

// --- Audit ---

export type AuditCycleStatus = "OPEN" | "CLOSED";

export type AuditResult = "VERIFIED" | "MISSING" | "DAMAGED";

export interface AuditItem {
  id: string;
  auditCycleId: string;
  assetId: string;
  asset: Asset;
  verifiedById: string | null;
  verifiedBy: UserSummary | null;
  result: AuditResult | null;
  notes: string | null;
  verifiedAt: string | null;
}

export interface AuditCycle {
  id: string;
  scopeDepartmentId: string | null;
  scopeLocation: string | null;
  startDate: string;
  endDate: string;
  status: AuditCycleStatus;
  createdById: string;
  createdBy: UserSummary;
  createdAt: string;
  // Stats (added by list API)
  verifiedCount?: number;
  discrepancyCount?: number;
  pendingCount?: number;
  // Detail view includes items
  items?: AuditItem[];
}

// --- Notification ---

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  isRead: boolean;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  createdAt: string;
}

// --- Reports ---

export interface DashboardMetrics {
  summary: {
    totalAssets: number;
    totalValue: number;
    activeAllocations: number;
    openMaintenance: number;
  };
  statusBreakdown: {
    status: AssetStatus;
    count: number;
  }[];
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    count: number;
  }[];
}

