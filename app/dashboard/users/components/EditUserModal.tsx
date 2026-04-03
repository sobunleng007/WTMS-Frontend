// "use client";

// import { useEffect, useState } from "react";
// import { X, Shield, BookOpen, User as UserIcon, Loader2 } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { User } from "@/lib/types/user";
// import { usersService } from "@/service/users/users.service";
// import {
//   departmentService,
//   Department,
// } from "@/service/departments/department.service";
// import { getFullName } from "../utils";
// import { Avatar } from "./Avatar";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";

// // ─── Types ────────────────────────────────────────────────────────────────────

// type EditUserForm = {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   address: string;
//   departmentId: number;
// };

// type Props = {
//   user: User;
//   onClose: () => void;
//   onSaved: (updated: User) => void;
// };

// // ─── Role config ──────────────────────────────────────────────────────────────

// const ROLES = [
//   {
//     value: "admin",
//     label: "Admin",
//     description: "Full system access",
//     Icon: Shield,
//     activeClass:
//       "border-violet-400 bg-violet-50 ring-2 ring-violet-100 text-violet-700",
//     iconClass: "text-violet-500",
//   },
//   {
//     value: "trainer",
//     label: "Trainer",
//     description: "Manage sessions",
//     Icon: BookOpen,
//     activeClass:
//       "border-teal-400 bg-teal-50 ring-2 ring-teal-100 text-teal-700",
//     iconClass: "text-teal-500",
//   },
//   {
//     value: "employee",
//     label: "Employee",
//     description: "View only",
//     Icon: UserIcon,
//     activeClass:
//       "border-blue-400 bg-blue-50 ring-2 ring-blue-100 text-blue-700",
//     iconClass: "text-blue-400",
//   },
// ] as const;

// // ─── Component ────────────────────────────────────────────────────────────────

// export function EditUserModal({ user: u, onClose, onSaved }: Props) {
//   const [selectedRole, setSelectedRole] = useState<string>(
//     u.role?.toLowerCase() ?? "employee"
//   );
//   const [selectedStatus, setSelectedStatus] = useState<"Active" | "Inactive">(
//     () => {
//       if (typeof u.status === "boolean")
//         return u.status ? "Active" : "Inactive";
//       return String(u.status).trim().toLowerCase() === "active"
//         ? "Active"
//         : "Inactive";
//     }
//   );
//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [loadingDepts, setLoadingDepts] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<EditUserForm>({
//     defaultValues: {
//       firstName: u.firstName,
//       lastName: u.lastName,
//       email: u.email,
//       phoneNumber: u.phoneNumber,
//       address: u.address,
//       departmentId: u.departmentId,
//     },
//   });

//   useEffect(() => {
//     setLoadingDepts(true);
//     departmentService
//       .getAll()
//       .then((data) => {
//         let arr: Department[] = [];
//         if (Array.isArray(data)) arr = data;
//         else if (data && Array.isArray((data as any).payload))
//           arr = (data as any).payload;
//         setDepartments(arr);
//       })
//       .catch(() => toast.error("Failed to load departments"))
//       .finally(() => setLoadingDepts(false));
//   }, []);

//   const onSubmit = async (data: EditUserForm) => {
//     try {
//       setSaving(true);
//       const updated = await usersService.update(u.id, {
//         ...data,
//         role: selectedRole,
//         status: selectedStatus === "Active",
//       } as any);

//       if (updated) {
//         toast.success("User updated successfully");
//         onSaved(updated as User);
//       } else {
//         toast.error("Update returned no data");
//       }
//     } catch {
//       toast.error("Failed to update user");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
//       onClick={onClose}
//     >
//       <div
//         className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
//           <div>
//             <h2 className="text-[15px] font-semibold text-slate-900">
//               Edit user
//             </h2>
//             <p className="mt-0.5 text-xs text-slate-400">
//               Update profile, role, and status
//             </p>
//           </div>
//           <button
//             type="button"
//             onClick={onClose}
//             className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
//           >
//             <X className="h-4 w-4" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)}>
//           <div className="max-h-[72vh] space-y-5 overflow-y-auto px-6 py-5">

//             {/* Identity strip */}
//             <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
//               <Avatar user={u} size="md" />
//               <div>
//                 <p className="text-[14px] font-semibold text-slate-800">
//                   {getFullName(u)}
//                 </p>
//                 <p className="text-[12px] text-slate-400">{u.email}</p>
//               </div>
//               <span className="ml-auto rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-medium capitalize text-slate-500">
//                 {u.role}
//               </span>
//             </div>

//             {/* Basic information */}
//             <div>
//               <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
//                 Basic information
//               </p>
//               <div className="grid grid-cols-2 gap-3">

//                 {/* First name */}
//                 <div className="flex flex-col gap-1">
//                   <label
//                     htmlFor="edit-firstName"
//                     className="text-[11px] font-medium text-slate-500"
//                   >
//                     First name <span className="text-red-400">*</span>
//                   </label>
//                   <input
//                     id="edit-firstName"
//                     {...register("firstName", { required: "Required" })}
//                     placeholder="First name"
//                     className={`rounded-lg border px-3 py-2 text-[13px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
//                       errors.firstName ? "border-red-300" : "border-slate-200"
//                     }`}
//                   />
//                   {errors.firstName && (
//                     <span className="text-[11px] text-red-500">
//                       {errors.firstName.message}
//                     </span>
//                   )}
//                 </div>

//                 {/* Last name */}
//                 <div className="flex flex-col gap-1">
//                   <label
//                     htmlFor="edit-lastName"
//                     className="text-[11px] font-medium text-slate-500"
//                   >
//                     Last name <span className="text-red-400">*</span>
//                   </label>
//                   <input
//                     id="edit-lastName"
//                     {...register("lastName", { required: "Required" })}
//                     placeholder="Last name"
//                     className={`rounded-lg border px-3 py-2 text-[13px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
//                       errors.lastName ? "border-red-300" : "border-slate-200"
//                     }`}
//                   />
//                   {errors.lastName && (
//                     <span className="text-[11px] text-red-500">
//                       {errors.lastName.message}
//                     </span>
//                   )}
//                 </div>

//                 {/* Email */}
//                 <div className="flex flex-col gap-1">
//                   <label
//                     htmlFor="edit-email"
//                     className="text-[11px] font-medium text-slate-500"
//                   >
//                     Email <span className="text-red-400">*</span>
//                   </label>
//                   <input
//                     id="edit-email"
//                     type="email"
//                     {...register("email", { required: "Required" })}
//                     placeholder="email@example.com"
//                     className={`rounded-lg border px-3 py-2 text-[13px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
//                       errors.email ? "border-red-300" : "border-slate-200"
//                     }`}
//                   />
//                   {errors.email && (
//                     <span className="text-[11px] text-red-500">
//                       {errors.email.message}
//                     </span>
//                   )}
//                 </div>

//                 {/* Phone */}
//                 <div className="flex flex-col gap-1">
//                   <label
//                     htmlFor="edit-phone"
//                     className="text-[11px] font-medium text-slate-500"
//                   >
//                     Phone number
//                   </label>
//                   <input
//                     id="edit-phone"
//                     {...register("phoneNumber")}
//                     placeholder="0xx xxx xxx"
//                     className="rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
//                   />
//                 </div>

//                 {/* Address */}
//                 <div className="col-span-2 flex flex-col gap-1">
//                   <label
//                     htmlFor="edit-address"
//                     className="text-[11px] font-medium text-slate-500"
//                   >
//                     Address
//                   </label>
//                   <input
//                     id="edit-address"
//                     {...register("address")}
//                     placeholder="City, Country"
//                     className="rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
//                   />
//                 </div>

//                 {/* Department */}
//                 <div className="col-span-2 flex flex-col gap-1">
//                   <label
//                     htmlFor="edit-dept"
//                     className="text-[11px] font-medium text-slate-500"
//                   >
//                     Department <span className="text-red-400">*</span>
//                   </label>
//                   <select
//                     id="edit-dept"
//                     {...register("departmentId", {
//                       valueAsNumber: true,
//                       required: "Required",
//                     })}
//                     disabled={loadingDepts}
//                     className={`rounded-lg border px-3 py-2 text-[13px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50 ${
//                       errors.departmentId
//                         ? "border-red-300"
//                         : "border-slate-200"
//                     }`}
//                   >
//                     <option value="">
//                       {loadingDepts ? "Loading…" : "Select a department"}
//                     </option>
//                     {departments.map((d) => (
//                       <option key={d.id} value={d.id}>
//                         {d.name}
//                       </option>
//                     ))}
//                   </select>
//                   {errors.departmentId && (
//                     <span className="text-[11px] text-red-500">
//                       {errors.departmentId.message}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Role picker */}
//             <div>
//               <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
//                 Role
//               </p>
//               <div className="grid grid-cols-3 gap-2">
//                 {ROLES.map(({ value, label, description, Icon, activeClass, iconClass }) => {
//                   const isSelected = selectedRole === value;
//                   return (
//                     <button
//                       key={value}
//                       type="button"
//                       onClick={() => setSelectedRole(value)}
//                       className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 text-center transition-all duration-150 ${
//                         isSelected
//                           ? activeClass
//                           : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
//                       }`}
//                     >
//                       <Icon
//                         className={`h-5 w-5 transition-colors ${
//                           isSelected ? iconClass : "text-slate-400"
//                         }`}
//                       />
//                       <div>
//                         <p className="text-[12px] font-semibold leading-tight">
//                           {label}
//                         </p>
//                         <p className="mt-0.5 text-[10px] leading-tight text-slate-400">
//                           {description}
//                         </p>
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Status toggle */}
//             <div>
//               <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
//                 Account status
//               </p>
//               <div className="flex gap-2">
//                 <button
//                   type="button"
//                   onClick={() => setSelectedStatus("Active")}
//                   className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[13px] font-semibold transition-all duration-150 ${
//                     selectedStatus === "Active"
//                       ? "border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100"
//                       : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
//                   }`}
//                 >
//                   <span
//                     className={`h-1.5 w-1.5 rounded-full ${
//                       selectedStatus === "Active"
//                         ? "bg-emerald-500"
//                         : "bg-slate-300"
//                     }`}
//                   />
//                   Active
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setSelectedStatus("Inactive")}
//                   className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[13px] font-semibold transition-all duration-150 ${
//                     selectedStatus === "Inactive"
//                       ? "border-red-400 bg-red-50 text-red-600 ring-2 ring-red-100"
//                       : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
//                   }`}
//                 >
//                   <span
//                     className={`h-1.5 w-1.5 rounded-full ${
//                       selectedStatus === "Inactive"
//                         ? "bg-red-500"
//                         : "bg-slate-300"
//                     }`}
//                   />
//                   Inactive
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
//             <Button
//               type="button"
//               variant="outline"
//               className="rounded-xl border-slate-200 text-slate-600"
//               onClick={onClose}
//               disabled={saving}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               disabled={saving}
//               className="min-w-[130px] rounded-xl bg-[#1f6fff] text-white hover:bg-blue-700 disabled:opacity-70"
//             >
//               {saving ? (
//                 <span className="flex items-center gap-2">
//                   <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                   Saving…
//                 </span>
//               ) : (
//                 "Save changes"
//               )}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }