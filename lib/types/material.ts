export type Material = {
  id: string;
  title: string;
  fileUrl: string;
  sessionId: number;
  trainerId: number;

  accessLevel?: "all" | "department" | "specific";

  // ✅ ADD THIS
  authorizedUsers?: number[];

  // OPTIONAL (for department logic)
  departmentId?: number;

  // existing fields...
  sessionTitle?: string;
  type?: string;
  size?: string;
  uploadedBy?: string;
  uploadedAt?: string;

  
};