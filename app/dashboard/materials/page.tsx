// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useAuth } from "@/lib/auth-store";
// import { RoleGuard } from "@/components/auth/role-guard";
// import { materialsService } from "@/service/materials/materials.service";
// import type { Material } from "@/lib/types/material";
// import { sessionsService } from "@/service/sessions/sessions.service";
// import type { TrainingSession } from "@/lib/types/session";
// import { usersService } from "@/service/users/users.service";
// import type { User } from "@/lib/types/user";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import {
//   FileText,
//   Presentation,
//   Video,
//   Search,
//   Download,
//   Upload,
//   Eye,
//   Filter,
//   FolderOpen,
//   Lock,
//   XCircle,
//   FileUp,
//   Trash2,
// } from "lucide-react";
// import { Skeleton } from "@/components/ui/skeleton";
// import { toast } from "sonner";

// // Types
// export type MaterialType = "pdf" | "slides" | "video";
// export type AccessLevel = "all" | "department" | "specific";

// type UIMaterial = Material & {
//   fileUrl?: string;
//   originalFileName?: string;
// };

// const typeConfig: Record<
//   MaterialType,
//   { icon: any; label: string; color: string }
// > = {
//   pdf: {
//     icon: FileText,
//     label: "PDF",
//     color: "bg-destructive/10 text-destructive",
//   },
//   slides: {
//     icon: Presentation,
//     label: "Slides",
//     color: "bg-wtms-orange/10 text-wtms-orange",
//   },
//   video: {
//     icon: Video,
//     label: "Video",
//     color: "bg-primary/10 text-primary",
//   },
// };

// const accessConfig: Record<AccessLevel, { label: string; color: string }> = {
//   all: {
//     label: "All Users",
//     color: "bg-wtms-green/10 text-wtms-green border-0",
//   },
//   department: {
//     label: "Department Only",
//     color: "bg-wtms-teal/10 text-wtms-teal border-0",
//   },
//   specific: {
//     label: "Authorized Only",
//     color: "bg-wtms-orange/10 text-wtms-orange border-0",
//   },
// };

// function formatFileSize(bytes: number) {
//   if (bytes < 1024) return `${bytes} B`;
//   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//   if (bytes < 1024 * 1024 * 1024)
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
//   return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
// }

// function inferMaterialType(file: File): MaterialType {
//   const name = file.name.toLowerCase();
//   if (file.type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
//   if (
//     name.endsWith(".ppt") ||
//     name.endsWith(".pptx") ||
//     name.endsWith(".key") ||
//     file.type.includes("presentation")
//   )
//     return "slides";
//   return "video";
// }

// function isValidFileForType(file: File, selectedType: MaterialType) {
//   const name = file.name.toLowerCase();
//   if (selectedType === "pdf")
//     return file.type === "application/pdf" || name.endsWith(".pdf");
//   if (selectedType === "slides") {
//     return (
//       name.endsWith(".ppt") ||
//       name.endsWith(".pptx") ||
//       name.endsWith(".key") ||
//       file.type.includes("presentation")
//     );
//   }
//   if (selectedType === "video") return file.type.startsWith("video/");
//   return false;
// }

// function MaterialsPageContent() {
//   // Track which session folders are open
//   const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

//   // Session meta info state
//   const [sessionsMap, setSessionsMap] = useState<
//     Record<string, TrainingSession>
//   >({});
//   const [trainersMap, setTrainersMap] = useState<Record<string, User>>({});

//   // Only allow one session open at a time
//   function toggleFolder(sessionTitle: string) {
//     setOpenFolders((prev) => {
//       const isCurrentlyOpen = !!prev[sessionTitle];
//       // Close all, then open the clicked one if it was closed
//       return isCurrentlyOpen
//         ? {} // close all
//         : { [sessionTitle]: true };
//     });
//   }
//   const { user } = useAuth();
//   const [materials, setMaterials] = useState<UIMaterial[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [typeFilter, setTypeFilter] = useState<"all" | MaterialType>("all");
//   const [showUpload, setShowUpload] = useState(false);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [dragging, setDragging] = useState(false);
//   const [uploadError, setUploadError] = useState("");
//   const fileInputRef = useRef<HTMLInputElement | null>(null);
//   const createdUrlsRef = useRef<Set<string>>(new Set());

//   const isAdmin = user?.role?.toLocaleLowerCase() === "admin";
//   const isTrainer = user?.role?.toLocaleLowerCase() === "trainer";
//   const canManageMaterials = isAdmin || isTrainer;

//   useEffect(() => {
//     loadMaterials();
//     loadSessions();
//   }, []);

//   const loadMaterials = async () => {
//     try {
//       setLoading(true);
//       const data = await materialsService.getAll();
//       setMaterials(data as UIMaterial[]);
//     } catch (error) {
//       toast.error("Failed to load materials");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch all trainers from DB (role: trainer, case-insensitive)
//   const [trainers, setTrainers] = useState<any[]>([]);

//   // Load trainers when upload dialog is opened and user is admin
//   useEffect(() => {
//     const fetchTrainers = async () => {
//       if (!isAdmin || !showUpload) return;
//       try {
//         // Try both lowercase and capitalized role for backend compatibility
//         let trainersList = await usersService.getAll({ role: "trainer" });
//         if (!trainersList || !trainersList.length) {
//           trainersList = await usersService.getAll({ role: "Trainer" });
//         }
//         // Filter to only users with role 'trainer' (case-insensitive)
//         const filtered = (trainersList || []).filter(
//           (u) => u.role && u.role.toLowerCase() === "trainer",
//         );
//         setTrainers(filtered);
//       } catch (err) {
//         setTrainers([]);
//       }
//     };
//     fetchTrainers();
//   }, [isAdmin, showUpload]);
//   // State for admin trainer select
//   const [selectedTrainerId, setSelectedTrainerId] = useState<string>("");

//   // Fetch all sessions and build a map for lookup
//   const loadSessions = async () => {
//     try {
//       const { payload } = await sessionsService.getAll();
//       const map: Record<string, TrainingSession> = {};
//       payload.forEach((session) => {
//         map[session.id] = session;
//       });
//       setSessionsMap(map);
//     } catch (error) {
//       toast.error("Failed to load sessions");
//     }
//   };

//   const filtered = materials.filter((m) => {
//     // Defensive: handle missing/null fields
//     const title = (m.title || "").toString().toLowerCase();
//     const sessionTitle = (m.sessionTitle || "").toString().toLowerCase();
//     const searchValue = search.trim().toLowerCase();
//     // If search is empty, match all
//     const matchesSearch =
//       !searchValue ||
//       title.includes(searchValue) ||
//       sessionTitle.includes(searchValue);
//     const matchesType = typeFilter === "all" || m.type === typeFilter;
//     return matchesSearch && matchesType;
//   });

//   const grouped = filtered.reduce<Record<string, UIMaterial[]>>((acc, m) => {
//     if (!acc[m.sessionTitle]) acc[m.sessionTitle] = [];
//     acc[m.sessionTitle].push(m);
//     return acc;
//   }, {});

//   function resetUploadState() {
//     setSelectedFile(null);
//     setDragging(false);
//     setUploadError("");
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   }

//   function handleOpenChange(open: boolean) {
//     setShowUpload(open);
//     if (!open) resetUploadState();
//   }

//   function handleSelectedFile(file: File | null, selectedType?: MaterialType) {
//     if (!file) return;
//     const maxSize = 500 * 1024 * 1024;
//     if (file.size > maxSize) {
//       setUploadError("File size must be 500MB or smaller.");
//       return;
//     }
//     if (selectedType && !isValidFileForType(file, selectedType)) {
//       setUploadError(
//         `Selected file does not match the chosen type: ${selectedType.toUpperCase()}.`,
//       );
//       return;
//     }
//     setUploadError("");
//     setSelectedFile(file);
//   }

//   function handleFileInputChange(
//     e: React.ChangeEvent<HTMLInputElement>,
//     selectedType?: MaterialType,
//   ) {
//     const file = e.target.files?.[0] || null;
//     handleSelectedFile(file, selectedType);
//   }

//   function handleDrop(
//     e: React.DragEvent<HTMLDivElement>,
//     selectedType?: MaterialType,
//   ) {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragging(false);
//     const file = e.dataTransfer.files?.[0] || null;
//     handleSelectedFile(file, selectedType);
//   }

//   function handleView(material: UIMaterial) {
//     if (!material.fileUrl) return;
//     window.open(material.fileUrl, "_blank", "noopener,noreferrer");
//   }

//   function handleDownload(material: UIMaterial) {
//     if (!material.fileUrl) return;
//     const a = document.createElement("a");
//     a.href = material.fileUrl;
//     a.download = material.originalFileName || material.title;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//   }

//   function handleDelete(material: UIMaterial) {
//     if (material.fileUrl && createdUrlsRef.current.has(material.fileUrl)) {
//       URL.revokeObjectURL(material.fileUrl);
//       createdUrlsRef.current.delete(material.fileUrl);
//     }
//     setMaterials((prev) => prev.filter((m) => m.id !== material.id));
//   }

//   async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     if (!canManageMaterials) return;
//     const fd = new FormData(e.currentTarget);
//     const title = (fd.get("title") as string)?.trim();
//     const sessionId = (fd.get("sessionId") as string)?.trim();
//     let trainerId: number | undefined = undefined;
//     if (isTrainer) {
//       trainerId = user?.id;
//     } else if (isAdmin) {
//       // Use selectedTrainerId from state
//       trainerId = selectedTrainerId ? parseInt(selectedTrainerId) : undefined;
//     }
//     if (!title || !sessionId || !trainerId) {
//       setUploadError("Please fill in all required fields.");
//       return;
//     }
//     if (!selectedFile) {
//       setUploadError("Please choose a file first.");
//       return;
//     }
//     if (
//       !isValidFileForType(
//         selectedFile,
//         (fd.get("type") as MaterialType) || "pdf",
//       )
//     ) {
//       setUploadError(
//         `The file does not match the selected type: ${((fd.get("type") as string) || "pdf").toUpperCase()}.`,
//       );
//       return;
//     }
//     // Simulate file upload (replace with real upload if available)
//     const blobUrl = URL.createObjectURL(selectedFile);
//     createdUrlsRef.current.add(blobUrl);
//     try {
//       await materialsService.create({
//         title,
//         fileUrl: blobUrl,
//         sessionId,
//         trainerId,
//       });
//       toast.success("Material uploaded successfully");
//       loadMaterials();
//       setShowUpload(false);
//       resetUploadState();
//       setSelectedTrainerId(""); // Reset trainer select after upload
//     } catch (err) {
//       setUploadError("Failed to upload material");
//     }
//   }

//   useEffect(() => {
//     return () => {
//       createdUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
//       createdUrlsRef.current.clear();
//     };
//   }, []);

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-foreground">
//             Training Materials
//           </h1>
//           <p className="mt-1 text-sm text-muted-foreground">
//             {canManageMaterials
//               ? "Upload, organize, and manage access to training materials."
//               : "Browse and download training materials."}
//           </p>
//         </div>
//         {canManageMaterials && (
//           <div className="flex gap-2">
//             <Button variant="outline" className="gap-2">
//               <FolderOpen className="size-4" />
//               Organize by Dept.
//             </Button>
//             <Button onClick={() => setShowUpload(true)} className="gap-2">
//               <Upload className="size-4" />
//               Upload Material
//             </Button>
//           </div>
//         )}
//       </div>
//       <div className="flex flex-col gap-3 sm:flex-row">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
//           <Input
//             placeholder="Search materials..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="pl-9"
//           />
//         </div>
//         <div className="flex items-center gap-2">
//           <Filter className="size-4 text-muted-foreground" />
//           {(["all", "pdf", "slides", "video"] as const).map((f) => (
//             <Button
//               key={f}
//               variant={typeFilter === f ? "default" : "outline"}
//               size="sm"
//               onClick={() => setTypeFilter(f)}
//               className="capitalize text-xs"
//             >
//               {f === "all" ? "All" : typeConfig[f as MaterialType].label}
//             </Button>
//           ))}
//         </div>
//       </div>
//       {loading ? (
//         <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
//           {Array.from({ length: 6 }).map((_, i) => (
//             <Card key={i} className="p-4">
//               <div className="flex items-start gap-3">
//                 <Skeleton className="size-10 rounded-lg" />
//                 <div className="flex-1 space-y-2">
//                   <Skeleton className="h-4 w-3/4" />
//                   <div className="flex gap-2">
//                     <Skeleton className="h-5 w-12" />
//                     <Skeleton className="h-4 w-16" />
//                   </div>
//                   <Skeleton className="h-3 w-1/2" />
//                   <div className="flex justify-between items-center">
//                     <Skeleton className="h-5 w-20" />
//                     <div className="flex gap-1">
//                       <Skeleton className="size-7" />
//                       <Skeleton className="size-7" />
//                     </div>
//                   </div>
//                   <Skeleton className="h-3 w-24" />
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </div>
//       ) : Object.entries(grouped).length === 0 ? (
//         <div className="py-16 text-center">
//           <FileText className="mx-auto size-10 text-muted-foreground/40" />
//           <p className="mt-3 text-sm text-muted-foreground">
//             No materials found.
//           </p>
//         </div>
//       ) : (
//         Object.entries(grouped).map(([session, mats]) => {
//           const isOpen = openFolders[session] || false;
//           // Find the first material in the group to get sessionId
//           const firstMaterial = mats[0];
//           const sessionId = firstMaterial?.sessionId;
//           const sessionInfo = sessionId ? sessionsMap[sessionId] : undefined;
//           const trainerId = sessionInfo?.trainer;
//           const trainer = trainerId
//             ? trainersMap[String(trainerId)]
//             : undefined;
//           return (
//             <div key={session} className="space-y-2">
//               <div
//                 className="flex items-center gap-2 cursor-pointer select-none hover:bg-muted rounded px-2 py-2"
//                 onClick={() => toggleFolder(session)}
//                 role="button"
//                 tabIndex={0}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" || e.key === " ") toggleFolder(session);
//                 }}
//                 aria-expanded={isOpen}
//               >
//                 <FolderOpen
//                   className={`size-4 ${isOpen ? "text-primary" : "text-muted-foreground"}`}
//                 />
//                 <div className="flex-1 min-w-0">
//                   <h2 className="text-sm font-semibold text-foreground truncate">
//                     {session}
//                   </h2>
//                   {sessionInfo && (
//                     <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
//                       <span>
//                         Trainer:{" "}
//                         {trainer
//                           ? `${trainer.firstName} ${trainer.lastName}`
//                           : "-"}
//                       </span>
//                       <span>
//                         Start:{" "}
//                         {sessionInfo.startDate
//                           ? new Date(sessionInfo.startDate).toLocaleDateString(
//                               "en-US",
//                               {
//                                 month: "short",
//                                 day: "numeric",
//                                 year: "numeric",
//                               },
//                             )
//                           : "-"}
//                       </span>
//                       <span>
//                         End:{" "}
//                         {sessionInfo.endDate
//                           ? new Date(sessionInfo.endDate).toLocaleDateString(
//                               "en-US",
//                               {
//                                 month: "short",
//                                 day: "numeric",
//                                 year: "numeric",
//                               },
//                             )
//                           : "-"}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//                 <Badge variant="secondary" className="text-[10px]">
//                   {mats.length} files
//                 </Badge>
//                 <span className="ml-2 text-xs text-muted-foreground">
//                   {isOpen ? "▼" : "▶"}
//                 </span>
//               </div>
//               {isOpen && (
//                 <div
//                   className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 pl-6 hide-scrollbar"
//                   style={{
//                     overflowY: "auto",
//                     maxHeight: "60vh",
//                     scrollbarWidth: "none",
//                     msOverflowStyle: "none",
//                     backgroundClip: "padding-box",
//                   }}
//                 >
//                   {mats.map((material) => {
//                     const cfg =
//                       typeConfig[material.type as MaterialType] ||
//                       typeConfig["pdf"];
//                     const acfg =
//                       accessConfig[material.accessLevel as AccessLevel] ||
//                       accessConfig["all"];
//                     const TypeIcon = cfg.icon;
//                     const canOpen = !!material.fileUrl;
//                     return (
//                       <Card
//                         key={material.id}
//                         className="transition-shadow hover:shadow-md"
//                       >
//                         <CardContent className="p-4">
//                           <div className="flex items-start gap-3">
//                             <div
//                               className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${cfg.color}`}
//                             >
//                               <TypeIcon className="size-5" />
//                             </div>
//                             <div className="min-w-0 flex-1">
//                               <p className="truncate text-sm font-medium text-foreground">
//                                 {material.title}
//                               </p>
//                               <div className="mt-1 flex items-center gap-2">
//                                 <Badge
//                                   className={`border-0 text-[10px] ${cfg.color}`}
//                                 >
//                                   {cfg.label}
//                                 </Badge>
//                                 <span className="text-[10px] text-muted-foreground">
//                                   {material.size}
//                                 </span>
//                               </div>
//                               {material.originalFileName && (
//                                 <p className="mt-1 truncate text-[10px] text-muted-foreground">
//                                   {material.originalFileName}
//                                 </p>
//                               )}
//                               <div className="mt-3 flex items-center justify-between">
//                                 <div className="flex items-center gap-1">
//                                   <Lock className="size-3 text-muted-foreground" />
//                                   <Badge
//                                     className={`text-[10px] ${acfg.color}`}
//                                   >
//                                     {acfg.label}
//                                   </Badge>
//                                 </div>
//                                 <div className="flex gap-1">
//                                   <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     className="size-7"
//                                     onClick={() => handleView(material)}
//                                     disabled={!canOpen}
//                                   >
//                                     <Eye className="size-3.5" />
//                                     <span className="sr-only">View</span>
//                                   </Button>
//                                   <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     className="size-7"
//                                     onClick={() => handleDownload(material)}
//                                     disabled={!canOpen}
//                                   >
//                                     <Download className="size-3.5" />
//                                     <span className="sr-only">Download</span>
//                                   </Button>
//                                   {canManageMaterials && (
//                                     <Button
//                                       variant="ghost"
//                                       size="icon"
//                                       className="size-7 text-destructive hover:text-destructive"
//                                       onClick={() => handleDelete(material)}
//                                     >
//                                       <XCircle className="size-3.5" />
//                                       <span className="sr-only">Delete</span>
//                                     </Button>
//                                   )}
//                                 </div>
//                               </div>
//                               <p className="mt-2 text-[10px] text-muted-foreground">
//                                 By {material.uploadedBy} &middot;{" "}
//                                 {new Date(
//                                   material.uploadedAt,
//                                 ).toLocaleDateString("en-US", {
//                                   month: "short",
//                                   day: "numeric",
//                                 })}
//                               </p>
//                             </div>
//                           </div>
//                         </CardContent>
//                       </Card>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })
//       )}
//       {canManageMaterials && (
//         <Dialog open={showUpload} onOpenChange={handleOpenChange}>
//           <DialogContent className="sm:max-w-md">
//             <DialogHeader>
//               <DialogTitle className="text-foreground">
//                 Upload Training Material
//               </DialogTitle>
//               <DialogDescription>
//                 Upload documents, slides, or videos for training sessions.
//               </DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleUpload} className="mt-2 space-y-4">
//               <div className="space-y-2">
//                 <Label className="text-foreground">Title</Label>
//                 <Input
//                   name="title"
//                   required
//                   placeholder="e.g. Cybersecurity Handbook"
//                   defaultValue={
//                     selectedFile
//                       ? selectedFile.name.replace(/\.[^/.]+$/, "")
//                       : ""
//                   }
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-2">
//                   <Label className="text-foreground">Type</Label>
//                   <select
//                     name="type"
//                     defaultValue={
//                       selectedFile ? inferMaterialType(selectedFile) : "pdf"
//                     }
//                     className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
//                   >
//                     <option value="pdf">PDF</option>
//                     <option value="slides">Slides</option>
//                     <option value="video">Video</option>
//                   </select>
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <Label className="text-foreground">Session</Label>
//                 <select
//                   name="sessionId"
//                   required
//                   className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
//                   defaultValue=""
//                 >
//                   <option value="" disabled>
//                     Select a session
//                   </option>
//                   {Object.values(sessionsMap)
//                     .filter((session) => {
//                       // Only show sessions that are active (status === true) and not ended yet
//                       if (!session.status) return false;
//                       if (!session.endDate) return true; // If no endDate, treat as active
//                       const now = new Date();
//                       const end = new Date(session.endDate);
//                       return end >= now;
//                     })
//                     .map((session) => (
//                       <option key={session.id} value={session.id}>
//                         {session.title}
//                       </option>
//                     ))}
//                 </select>
//               </div>
//               {isAdmin && (
//                 <div className="space-y-2">
//                   <Label>Trainer</Label>
//                   <Select
//                     value={selectedTrainerId}
//                     onValueChange={setSelectedTrainerId}
//                     required
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select trainer" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {trainers.length === 0 && (
//                         <SelectItem value="no-trainers" disabled>
//                           No trainers found
//                         </SelectItem>
//                       )}
//                       {trainers.map((t) => (
//                         <SelectItem key={t.id} value={String(t.id)}>
//                           {t.firstName} {t.lastName} ({t.email})
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               )}
//               <div className="space-y-2">
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept=".pdf,.ppt,.pptx,video/*"
//                   className="hidden"
//                   onChange={(e) => {
//                     const form = e.currentTarget.form;
//                     const typeField = form?.elements.namedItem(
//                       "type",
//                     ) as HTMLSelectElement | null;
//                     const selectedType = (typeField?.value ||
//                       "pdf") as MaterialType;
//                     handleFileInputChange(e, selectedType);
//                   }}
//                 />
//                 <div
//                   onClick={() => fileInputRef.current?.click()}
//                   onDragOver={(e) => {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     setDragging(true);
//                   }}
//                   onDragEnter={(e) => {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     setDragging(true);
//                   }}
//                   onDragLeave={(e) => {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     setDragging(false);
//                   }}
//                   onDrop={(e) => {
//                     const form = e.currentTarget.closest("form");
//                     const typeField = form?.elements.namedItem(
//                       "type",
//                     ) as HTMLSelectElement | null;
//                     const selectedType = (typeField?.value ||
//                       "pdf") as MaterialType;
//                     handleDrop(e, selectedType);
//                   }}
//                   className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition ${
//                     dragging
//                       ? "border-primary bg-primary/5"
//                       : "border-border hover:border-primary/50 hover:bg-muted/30"
//                   }`}
//                 >
//                   <FileUp className="mx-auto size-8 text-muted-foreground/40" />
//                   <p className="mt-2 text-sm text-muted-foreground">
//                     Drag and drop or click to upload
//                   </p>
//                   <p className="mt-1 text-xs text-muted-foreground/60">
//                     PDF, PPT, PPTX, MP4 up to 500MB
//                   </p>
//                 </div>
//                 {selectedFile && (
//                   <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
//                     <div className="min-w-0">
//                       <p className="truncate text-sm font-medium text-foreground">
//                         {selectedFile.name}
//                       </p>
//                       <p className="text-xs text-muted-foreground">
//                         {formatFileSize(selectedFile.size)}
//                       </p>
//                     </div>
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="icon"
//                       onClick={resetUploadState}
//                     >
//                       <Trash2 className="size-4" />
//                     </Button>
//                   </div>
//                 )}
//                 {uploadError && (
//                   <p className="text-sm font-medium text-destructive">
//                     {uploadError}
//                   </p>
//                 )}
//               </div>
//               <div className="flex justify-end gap-2 pt-2">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => handleOpenChange(false)}
//                 >
//                   Cancel
//                 </Button>
//                 <Button type="submit">Upload</Button>
//               </div>
//             </form>
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   );
// }

// export default function MaterialsPage() {
//   return (
//     <RoleGuard allowed={["admin", "trainer", "employee"]}>
//       <MaterialsPageContent />
//     </RoleGuard>
//   );
// }



"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { RoleGuard } from "@/components/auth/role-guard";
import { materialsService } from "@/service/materials/materials.service";
import type { Material } from "@/lib/types/material";
import { sessionsService } from "@/service/sessions/sessions.service";
import type { TrainingSession } from "@/lib/types/session";
import { usersService } from "@/service/users/users.service";
import type { User } from "@/lib/types/user";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Presentation,
  Video,
  Search,
  Download,
  Upload,
  Eye,
  Filter,
  FolderOpen,
  Lock,
  XCircle,
  FileUp,
  Trash2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export type MaterialType = "pdf" | "slides" | "video";
export type AccessLevel = "all" | "department" | "specific";

type UIMaterial = Material & {
  originalFileName?: string;
};

const typeConfig: Record<MaterialType, { icon: any; label: string; color: string }> = {
  pdf: { icon: FileText, label: "PDF", color: "bg-destructive/10 text-destructive" },
  slides: { icon: Presentation, label: "Slides", color: "bg-wtms-orange/10 text-wtms-orange" },
  video: { icon: Video, label: "Video", color: "bg-primary/10 text-primary" },
};

const accessConfig: Record<AccessLevel, { label: string; color: string }> = {
  all: { label: "All Users", color: "bg-wtms-green/10 text-wtms-green border-0" },
  department: { label: "Department Only", color: "bg-wtms-teal/10 text-wtms-teal border-0" },
  specific: { label: "Authorized Only", color: "bg-wtms-orange/10 text-wtms-orange border-0" },
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function inferMaterialType(file: File): MaterialType {
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".ppt") || name.endsWith(".pptx") || name.endsWith(".key") || file.type.includes("presentation"))
    return "slides";
  return "video";
}

function isValidFileForType(file: File, type: MaterialType) {
  const name = file.name.toLowerCase();
  if (type === "pdf") return file.type === "application/pdf" || name.endsWith(".pdf");
  if (type === "slides") return name.endsWith(".ppt") || name.endsWith(".pptx") || name.endsWith(".key") || file.type.includes("presentation");
  if (type === "video") return file.type.startsWith("video/");
  return false;
}

function MaterialsPageContent() {
  const { user } = useAuth();

  // ── Data state ─────────────────────────────────────────────────────────────
  const [materials, setMaterials] = useState<UIMaterial[]>([]);
  const [sessionsMap, setSessionsMap] = useState<Record<string, TrainingSession>>({});
  const [trainersMap, setTrainersMap] = useState<Record<string, User>>({});
  const [trainers, setTrainers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | MaterialType>("all");

  // ── Upload dialog state ─────────────────────────────────────────────────────
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<MaterialType>("pdf");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const createdUrlsRef = useRef<Set<string>>(new Set());

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isTrainer = user?.role?.toLowerCase() === "trainer";
  const canManageMaterials = isAdmin || isTrainer;

  // ── Derived: resolve trainerId from session when trainer is logged in ───────
  // For trainers we derive their id directly from the auth user; no select needed.

  // ── Load on mount ───────────────────────────────────────────────────────────
  useEffect(() => {
    loadMaterials();
    loadSessions();
  }, []);

  // ── Load trainers when admin opens upload dialog ────────────────────────────
  useEffect(() => {
    if (!isAdmin || !showUpload) return;
    (async () => {
      try {
        let list = await usersService.getAll({ role: "trainer" });
        if (!list?.length) list = await usersService.getAll({ role: "Trainer" });
        const filtered = (list || []).filter(
          (u) => u.role?.toLowerCase() === "trainer"
        );
        setTrainers(filtered);
      } catch {
        setTrainers([]);
      }
    })();
  }, [isAdmin, showUpload]);

  // ── Fetch all materials ─────────────────────────────────────────────────────
  async function loadMaterials() {
    try {
      setLoading(true);
      const data = await materialsService.getAll();
      setMaterials(data as UIMaterial[]);
    } catch {
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  }

  // ── Fetch all sessions ──────────────────────────────────────────────────────
  async function loadSessions() {
    try {
      const { payload } = await sessionsService.getAll();
      const map: Record<string, TrainingSession> = {};
      payload.forEach((s) => { map[s.id] = s; });
      setSessionsMap(map);
    } catch {
      toast.error("Failed to load sessions");
    }
  }

  // ── Filter + group ──────────────────────────────────────────────────────────
  const filtered = materials.filter((m) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (m.title || "").toLowerCase().includes(q) ||
      (m.sessionTitle || "").toLowerCase().includes(q);
    const matchesType = typeFilter === "all" || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const grouped = filtered.reduce<Record<string, UIMaterial[]>>((acc, m) => {
    const key = m.sessionTitle || "Unknown Session";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  // ── Folder accordion (single open) ─────────────────────────────────────────
  function toggleFolder(key: string) {
    setOpenFolders((prev) =>
      prev[key] ? {} : { [key]: true }
    );
  }

  // ── Upload dialog helpers ───────────────────────────────────────────────────
  function resetUploadState() {
    setSelectedFile(null);
    setSelectedType("pdf");
    setSelectedSessionId("");
    setSelectedTrainerId("");
    setUploadTitle("");
    setDragging(false);
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleOpenChange(open: boolean) {
    setShowUpload(open);
    if (!open) resetUploadState();
  }

  function applyFile(file: File | null) {
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) {
      setUploadError("File size must be 500 MB or smaller.");
      return;
    }
    setUploadError("");
    setSelectedFile(file);
    // Auto-fill title from filename if empty
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
    // Auto-detect type
    setSelectedType(inferMaterialType(file));
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    applyFile(e.dataTransfer.files?.[0] ?? null);
  }

  // ── Material actions ────────────────────────────────────────────────────────
  function handleView(m: UIMaterial) {
    if (!m.fileUrl) return;
    window.open(m.fileUrl, "_blank", "noopener,noreferrer");
  }

  function handleDownload(m: UIMaterial) {
    if (!m.fileUrl) return;
    const a = document.createElement("a");
    a.href = m.fileUrl;
    a.download = m.originalFileName || m.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function handleDelete(m: UIMaterial) {
    try {
      await materialsService.delete(String(m.id));
      if (m.fileUrl && createdUrlsRef.current.has(m.fileUrl)) {
        URL.revokeObjectURL(m.fileUrl);
        createdUrlsRef.current.delete(m.fileUrl);
      }
      setMaterials((prev) => prev.filter((x) => x.id !== m.id));
      toast.success("Material deleted");
    } catch {
      toast.error("Failed to delete material");
    }
  }

  // // ── Upload submit ───────────────────────────────────────────────────────────
  // async function handleUpload(e: React.FormEvent) {
  //   e.preventDefault();
  //   if (!canManageMaterials) return;

  //   const title = uploadTitle.trim();
  //   const sessionId = parseInt(selectedSessionId, 10);
  //   const trainerId = isTrainer
  //     ? user?.id
  //     : selectedTrainerId
  //       ? parseInt(selectedTrainerId, 10)
  //       : undefined;

  //   if (!title || !sessionId || !trainerId) {
  //     setUploadError("Please fill in all required fields.");
  //     return;
  //   }
  //   if (!selectedFile) {
  //     setUploadError("Please choose a file first.");
  //     return;
  //   }
  //   if (!isValidFileForType(selectedFile, selectedType)) {
  //     setUploadError(`File does not match the selected type: ${selectedType.toUpperCase()}.`);
  //     return;
  //   }

  //   // ⚠️  Replace blobUrl with a real storage upload (S3, Cloudinary, etc.)
  //   // when your backend/infra supports it.
  //   const fileUrl = URL.createObjectURL(selectedFile);
  //   createdUrlsRef.current.add(fileUrl);

  //   try {
  //     setUploading(true);
  //     await materialsService.create({ title, fileUrl, sessionId, trainerId });
  //     toast.success("Material uploaded successfully");
  //     await loadMaterials();
  //     handleOpenChange(false);
  //   } catch {
  //     URL.revokeObjectURL(fileUrl);
  //     createdUrlsRef.current.delete(fileUrl);
  //     setUploadError("Failed to upload material. Please try again.");
  //   } finally {
  //     setUploading(false);
  //   }
  // }

  async function handleUpload(e: React.FormEvent) {
  e.preventDefault();

  if (!canManageMaterials) return;

  const title = uploadTitle.trim();
  const sessionId = Number(selectedSessionId);
  const trainerId = isTrainer
    ? user?.id
    : selectedTrainerId
    ? Number(selectedTrainerId)
    : undefined;

  if (!title || !sessionId || !trainerId) {
    setUploadError("Please fill in all required fields.");
    return;
  }

  if (!selectedFile) {
    setUploadError("Please choose a file.");
    return;
  }

  try {
    setUploading(true);
    setUploadError("");

    // ✅ STEP 1: Upload file
    const fileUrl = await materialsService.uploadFile(selectedFile);

    // ✅ STEP 2: Send to backend
    await materialsService.create({
      title,
      fileUrl,
      sessionId,
      trainerId,
    });

    toast.success("Material uploaded successfully");

    await loadMaterials();
    handleOpenChange(false);

  } catch (err: any) {
    console.error(err.response?.data); // 👈 VERY IMPORTANT
    setUploadError(err.response?.data?.message || "Upload failed");
  } finally {
    setUploading(false);
  }
}

  // ── Cleanup blob URLs on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      createdUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      createdUrlsRef.current.clear();
    };
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Training Materials</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {canManageMaterials
              ? "Upload, organize, and manage training materials."
              : "Browse and download training materials."}
          </p>
        </div>
        {canManageMaterials && (
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <FolderOpen className="size-4" />
              Organize by Dept.
            </Button>
            <Button onClick={() => setShowUpload(true)} className="gap-2">
              <Upload className="size-4" />
              Upload Material
            </Button>
          </div>
        )}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          {(["all", "pdf", "slides", "video"] as const).map((f) => (
            <Button
              key={f}
              variant={typeFilter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(f)}
              className="capitalize text-xs"
            >
              {f === "all" ? "All" : typeConfig[f as MaterialType].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Material list */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="size-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-20" />
                    <div className="flex gap-1">
                      <Skeleton className="size-7" />
                      <Skeleton className="size-7" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : Object.entries(grouped).length === 0 ? (
        <div className="py-16 text-center">
          <FileText className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No materials found.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([sessionTitle, mats]) => {
          const isOpen = !!openFolders[sessionTitle];
          const sessionId = mats[0]?.sessionId;
          const sessionInfo = sessionId ? sessionsMap[String(sessionId)] : undefined;
          const trainer = sessionInfo?.trainer
            ? trainersMap[String(sessionInfo.trainer)]
            : undefined;

          return (
            <div key={sessionTitle} className="space-y-2">
              {/* Folder header */}
              <div
                className="flex items-center gap-2 cursor-pointer select-none hover:bg-muted rounded px-2 py-2"
                onClick={() => toggleFolder(sessionTitle)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") toggleFolder(sessionTitle);
                }}
                aria-expanded={isOpen}
              >
                <FolderOpen className={`size-4 ${isOpen ? "text-primary" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-foreground truncate">{sessionTitle}</h2>
                  {sessionInfo && (
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                      <span>
                        Trainer:{" "}
                        {trainer ? `${trainer.firstName} ${trainer.lastName}` : "-"}
                      </span>
                      <span>
                        Start:{" "}
                        {sessionInfo.startDate
                          ? new Date(sessionInfo.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "-"}
                      </span>
                      <span>
                        End:{" "}
                        {sessionInfo.endDate
                          ? new Date(sessionInfo.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "-"}
                      </span>
                    </div>
                  )}
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {mats.length} files
                </Badge>
                <span className="ml-2 text-xs text-muted-foreground">{isOpen ? "▼" : "▶"}</span>
              </div>

              {/* Material cards */}
              {isOpen && (
                <div
                  className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 pl-6"
                  style={{ overflowY: "auto", maxHeight: "60vh", scrollbarWidth: "none" }}
                >
                  {mats.map((material) => {
                    const cfg = typeConfig[material.type as MaterialType] ?? typeConfig.pdf;
                    const acfg = accessConfig[material.accessLevel as AccessLevel] ?? accessConfig.all;
                    const TypeIcon = cfg.icon;
                    const canOpen = !!material.fileUrl && (material.accessLevel === "all" || material.accessLevel === "department" || (material.accessLevel === "specific" && user?.id && material.authorizedUsers?.includes(user.id)));

                    return (
                      <Card key={material.id} className="transition-shadow hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${cfg.color}`}>
                              <TypeIcon className="size-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">{material.title}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <Badge className={`border-0 text-[10px] ${cfg.color}`}>{cfg.label}</Badge>
                                {material.size && (
                                  <span className="text-[10px] text-muted-foreground">{material.size}</span>
                                )}
                              </div>
                              {material.originalFileName && (
                                <p className="mt-1 truncate text-[10px] text-muted-foreground">
                                  {material.originalFileName}
                                </p>
                              )}
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Lock className="size-3 text-muted-foreground" />
                                  <Badge className={`text-[10px] ${acfg.color}`}>{acfg.label}</Badge>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    onClick={() => handleView(material)}
                                    disabled={!canOpen}
                                    title="View"
                                  >
                                    <Eye className="size-3.5" />
                                    <span className="sr-only">View</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    onClick={() => handleDownload(material)}
                                    disabled={!canOpen}
                                    title="Download"
                                  >
                                    <Download className="size-3.5" />
                                    <span className="sr-only">Download</span>
                                  </Button>
                                  {canManageMaterials && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-7 text-destructive hover:text-destructive"
                                      onClick={() => handleDelete(material)}
                                      title="Delete"
                                    >
                                      <XCircle className="size-3.5" />
                                      <span className="sr-only">Delete</span>
                                    </Button>
                                  )}
                                </div>
                              </div>
                              {(material.uploadedBy || material.uploadedAt) && (
                                <p className="mt-2 text-[10px] text-muted-foreground">
                                  {material.uploadedBy && <>By {material.uploadedBy} &middot; </>}
                                  {material.uploadedAt &&
                                    new Date(material.uploadedAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Upload dialog */}
      {canManageMaterials && (
        <Dialog open={showUpload} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Upload Training Material</DialogTitle>
              <DialogDescription>
                Upload documents, slides, or videos for training sessions.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpload} className="mt-2 space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label className="text-foreground">Title</Label>
                <Input
                  required
                  placeholder="e.g. Cybersecurity Handbook"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label className="text-foreground">Type</Label>
                <Select
                  value={selectedType}
                  onValueChange={(v) => setSelectedType(v as MaterialType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="slides">Slides</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Session */}
              <div className="space-y-2">
                <Label className="text-foreground">Session</Label>
                <Select
                  required
                  value={selectedSessionId}
                  onValueChange={setSelectedSessionId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a session" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(sessionsMap)
                      .filter((s) => {
                        if (!s.status) return false;
                        if (!s.endDate) return true;
                        return new Date(s.endDate) >= new Date();
                      })
                      .map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Trainer (admin only) */}
              {isAdmin && (
                <div className="space-y-2">
                  <Label className="text-foreground">Trainer</Label>
                  <Select
                    required
                    value={selectedTrainerId}
                    onValueChange={setSelectedTrainerId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trainer" />
                    </SelectTrigger>
                    <SelectContent>
                      {trainers.length === 0 ? (
                        <SelectItem value="none" disabled>No trainers found</SelectItem>
                      ) : (
                        trainers.map((t) => (
                          <SelectItem key={t.id} value={String(t.id)}>
                            {t.firstName} {t.lastName} ({t.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* File drop zone */}
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.ppt,.pptx,video/*"
                  className="hidden"
                  onChange={(e) => applyFile(e.target.files?.[0] ?? null)}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
                  onDrop={handleDrop}
                  className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition ${
                    dragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <FileUp className="mx-auto size-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag and drop or click to upload
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    PDF, PPT, PPTX, MP4 up to 500 MB
                  </p>
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={resetUploadState}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )}

                {uploadError && (
                  <p className="text-sm font-medium text-destructive">{uploadError}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function MaterialsPage() {
  return (
    <RoleGuard allowed={["admin", "trainer", "employee"]}>
      <MaterialsPageContent />
    </RoleGuard>
  );
}