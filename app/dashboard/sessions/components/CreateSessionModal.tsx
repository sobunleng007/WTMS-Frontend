"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-store";
import { usersService } from "@/service/users/users.service";
import { departmentService } from "@/service/departments/department.service";
import type { Department } from "@/service/departments/department.service";

type CreateSessionPayload = {
  title: string;
  description: string;
  numSession: number;
  startDate: string;
  endDate: string;
  departmentId: number;
  instructorId: number;
};

type Props = {
  open: boolean;
  onCloseAction: () => void;
  onSubmitAction: (data: CreateSessionPayload) => void;
  trainerName?: string;
  trainerId?: number;
  departmentId?: number;
  departmentName?: string;
};

function toIso(dateStr: string): string {
  if (!dateStr) return dateStr;
  if (dateStr.includes("T") && dateStr.endsWith("Z")) return dateStr;
  if (dateStr.length === 10) return `${dateStr}T00:00:00.000Z`;
  if (dateStr.includes("T") && !dateStr.endsWith("Z")) return `${dateStr}.000Z`;
  return dateStr;
}

export function CreateSessionModal({
  open,
  onCloseAction,
  onSubmitAction,
  trainerId,
  departmentId,
}: Props) {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [numSession, setNumSession] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [trainers, setTrainers] = useState<any[]>([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>("");
  const [department, setDepartment] = useState<Department | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState(
    String(departmentId || user?.departmentId || ""),
  );
  const [deptLoading, setDeptLoading] = useState(false);

  // Load trainers when modal opens
  useEffect(() => {
    if (!open) return;
    async function fetchTrainers() {
      const all = await usersService.getByRole("TRAINER");
      setTrainers(all);
      const defaultId = trainerId
        ? String(trainerId)
        : all.length > 0
          ? String(all[0].id)
          : "";
      setSelectedTrainerId(defaultId);
    }
    fetchTrainers();
  }, [open, trainerId]);

  // Resolve department whenever trainer changes
  useEffect(() => {
    if (!selectedTrainerId) return;
    async function fetchDept() {
      setDeptLoading(true);
      try {
        const dept = await departmentService.getByUserId(selectedTrainerId);
        setDepartment(dept);
        if (dept) setSelectedDeptId(String(dept.id));
      } catch {
        setDepartment(null);
      } finally {
        setDeptLoading(false);
      }
    }
    fetchDept();
  }, [selectedTrainerId]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: CreateSessionPayload = {
      title,
      description,
      numSession: Number(numSession),
      startDate: toIso(startDate),
      endDate: toIso(endDate),
      departmentId: Number(selectedDeptId),
      instructorId: Number(selectedTrainerId || trainerId || user?.id),
    };

    onSubmitAction(payload);

    // Reset form
    setTitle("");
    setDescription("");
    setNumSession(1);
    setStartDate("");
    setEndDate("");
  };

  return (
    <Dialog open={open} onOpenChange={onCloseAction}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Training Session</DialogTitle>
          <DialogDescription>
            Set up a new training program for your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Backend Development"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Brief description..."
              rows={3}
            />
          </div>

          {/* TrainerId - Trainer dropdown */}
          <div className="space-y-2">
            <Label>Trainer ({selectedTrainerId || "Not selected"})</Label>
            <Select
              value={selectedTrainerId}
              onValueChange={setSelectedTrainerId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select trainer" />
              </SelectTrigger>
              <SelectContent>
                {trainers.length === 0 && (
                  <SelectItem value="__empty__" disabled>
                    No trainers found
                  </SelectItem>
                )}
                {trainers.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.first_name ?? t.firstName}{" "}
                    {t.last_name ?? t.lastName}{" "}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department — auto-resolved from trainer */}
          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={selectedDeptId} disabled>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    deptLoading ? "Loading..." : "Resolved from trainer"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {department ? (
                  <SelectItem value={String(department.id)}>
                    {department.name}
                  </SelectItem>
                ) : (
                  <SelectItem value="__none__" disabled>
                    {deptLoading ? "Loading..." : "No department found"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Number of Sessions */}
          <div className="space-y-2">
            <Label htmlFor="numSession">Number of Sessions</Label>
            <Input
              id="numSession"
              type="number"
              value={numSession}
              onChange={(e) => setNumSession(Number(e.target.value))}
              required
              min={1}
              placeholder="e.g. 10"
            />
          </div>

          {/* Start / End Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCloseAction}>
              Cancel
            </Button>
            <Button type="submit" disabled={deptLoading}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
