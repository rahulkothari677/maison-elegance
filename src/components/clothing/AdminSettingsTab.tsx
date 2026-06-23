"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Trash2, Shield, Activity, KeyRound, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Admin = {
  email: string;
  source: "system" | "database";
  addedAt: string | null;
  addedBy: string | null;
  canRemove: boolean;
};

type Activity = {
  id: string;
  adminEmail: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: string | null;
  createdAt: string;
};

export function AdminSettingsTab() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adding, setAdding] = useState(false);

  // Change password form
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/settings").then((r) => r.json()),
      fetch("/api/admin/activity?limit=50").then((r) => r.json()),
    ])
      .then(([adminsData, activityData]) => {
        setAdmins(adminsData.admins || []);
        setActivities(activityData.activities || []);
      })
      .catch(() => toast.error("Failed to load admin settings"))
      .finally(() => setLoading(false));
  }, []);

  const addAdmin = async () => {
    if (!newAdminEmail || !newAdminEmail.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newAdminEmail }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(data.message);
        setNewAdminEmail("");
        // Refresh admin list
        const refreshRes = await fetch("/api/admin/settings");
        const refreshData = await refreshRes.json();
        setAdmins(refreshData.admins || []);
        // Refresh activity
        const actRes = await fetch("/api/admin/activity?limit=50");
        const actData = await actRes.json();
        setActivities(actData.activities || []);
      } else {
        toast.error(data.error || "Failed to add admin");
      }
    } catch {
      toast.error("Failed to add admin");
    } finally {
      setAdding(false);
    }
  };

  const removeAdmin = async (email: string) => {
    if (!confirm(`Remove ${email} from admin? They will lose access immediately.`)) return;
    try {
      const res = await fetch(`/api/admin/settings?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(data.message);
        setAdmins(admins.filter((a) => a.email !== email));
        // Refresh activity
        const actRes = await fetch("/api/admin/activity?limit=50");
        const actData = await actRes.json();
        setActivities(actData.activities || []);
      } else {
        toast.error(data.error || "Failed to remove admin");
      }
    } catch {
      toast.error("Failed to remove admin");
    }
  };

  const changePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwordForm.new.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Password changed successfully");
        setPasswordForm({ current: "", new: "", confirm: "" });
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const actionColors: Record<string, string> = {
    added_admin: "bg-green-100 text-green-800",
    removed_admin: "bg-red-100 text-red-800",
    login: "bg-blue-100 text-blue-800",
    order_updated: "bg-yellow-100 text-yellow-800",
    product_updated: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-serif text-3xl mb-2">Admin Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage admin access, change your password, and view activity log.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Change Password */}
        <div className="p-6 border border-border rounded-sm">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-lg">Change Password</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1.5 block">Current Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="rounded-sm"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">New Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="rounded-sm"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                minLength={8}
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Confirm New Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="rounded-sm"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                minLength={8}
              />
            </div>
            <Button
              className="w-full rounded-sm"
              disabled={changingPassword}
              onClick={changePassword}
            >
              {changingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </div>

        {/* Manage Admins */}
        <div className="p-6 border border-border rounded-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-lg">Manage Admin Access</h3>
          </div>

          {/* Add new admin */}
          <div className="flex gap-2 mb-4">
            <Input
              type="email"
              placeholder="admin@email.com"
              className="rounded-sm text-xs"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
            />
            <Button
              size="sm"
              className="rounded-sm shrink-0"
              disabled={adding}
              onClick={addAdmin}
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              {adding ? "Adding..." : "Add"}
            </Button>
          </div>

          {/* Admin list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {admins.map((admin) => (
              <div
                key={admin.email}
                className="flex items-center justify-between p-3 border border-border rounded-sm"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{admin.email}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] uppercase",
                        admin.source === "system"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-green-50 text-green-700 border-green-200"
                      )}
                    >
                      {admin.source === "system" ? "System" : "Added"}
                    </Badge>
                    {admin.addedBy && (
                      <span className="text-[10px] text-muted-foreground">
                        by {admin.addedBy}
                      </span>
                    )}
                  </div>
                </div>
                {admin.canRemove ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeAdmin(admin.email)}
                    className="text-destructive hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="p-6 border border-border rounded-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-accent" />
          <h3 className="font-serif text-lg">Activity Log</h3>
          <Badge variant="outline" className="ml-auto text-[10px]">
            Last 50
          </Badge>
        </div>

        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No activity recorded yet
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 border border-border rounded-sm"
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full mt-1.5 shrink-0",
                    actionColors[activity.action]?.split(" ")[0].replace("bg-", "bg-") || "bg-gray-400"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{activity.adminEmail}</span>
                    <Badge
                      variant="outline"
                      className={cn("text-[9px] uppercase", actionColors[activity.action] || "bg-gray-100 text-gray-800")}
                    >
                      {activity.action.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  {activity.details && (
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.details}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
