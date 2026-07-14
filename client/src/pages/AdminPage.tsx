import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Users, Briefcase, Shield, Loader2 } from "lucide-react";
import SiteNav from "@/components/SiteNav";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"leads" | "inquiries">("leads");

  const { data: leads, isLoading: leadsLoading } = trpc.leads.list.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const { data: inquiries, isLoading: inquiriesLoading } = trpc.business.list.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090514] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#090514] flex flex-col">
        <SiteNav />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center space-y-6 max-w-md px-4">
            <Shield className="w-16 h-16 text-purple-400 mx-auto" />
            <h1 className="text-2xl font-display font-bold text-white">Admin Access Required</h1>
            <p className="text-muted-foreground">You must be signed in with an admin account to access this page.</p>
            <Button
              onClick={() => { window.location.href = getLoginUrl(); }}
              className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Not admin
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#090514] flex flex-col">
        <SiteNav />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center space-y-6 max-w-md px-4">
            <Shield className="w-16 h-16 text-red-400 mx-auto" />
            <h1 className="text-2xl font-display font-bold text-white">Access Denied</h1>
            <p className="text-muted-foreground">Your account does not have admin privileges.</p>
          </div>
        </div>
      </div>
    );
  }

  // CSV Export
  const exportCSV = (type: "leads" | "inquiries") => {
    let csvContent = "";
    if (type === "leads" && leads) {
      csvContent = "Email,Source,Date\n";
      leads.forEach((lead) => {
        csvContent += `"${lead.email}","${lead.source}","${lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ""}"\n`;
      });
    } else if (type === "inquiries" && inquiries) {
      csvContent = "Company,Contact,Email,Phone,Project,Budget,Timeline,Date\n";
      inquiries.forEach((inq) => {
        csvContent += `"${inq.companyName}","${inq.contactName}","${inq.email}","${inq.phone || ""}","${inq.projectDescription?.replace(/"/g, '""') || ""}","${inq.budget || ""}","${inq.timeline || ""}","${inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : ""}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#090514] flex flex-col">
      <SiteNav />

      <main className="flex-1 pt-28 pb-16 px-4">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-display font-bold text-white">Admin Dashboard</h1>
            <p className="text-muted-foreground">View and export captured leads and business inquiries.</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
            <button
              onClick={() => setActiveTab("leads")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "leads"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              <Users className="w-4 h-4" />
              Leads ({leads?.length ?? 0})
            </button>
            <button
              onClick={() => setActiveTab("inquiries")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "inquiries"
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Inquiries ({inquiries?.length ?? 0})
            </button>
          </div>

          {/* Leads Table */}
          {activeTab === "leads" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Newsletter & Waitlist Leads</h2>
                <Button
                  onClick={() => exportCSV("leads")}
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-white/10 text-[#E2E8F0] hover:bg-white/5"
                  disabled={!leads || leads.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              </div>

              {leadsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
              ) : !leads || leads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No leads captured yet.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-white/70 font-mono text-xs">Email</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs">Source</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id} className="border-white/5 hover:bg-white/[0.03]">
                          <TableCell className="text-white font-medium">{lead.email}</TableCell>
                          <TableCell className="text-muted-foreground">
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                              {lead.source}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* Business Inquiries Table */}
          {activeTab === "inquiries" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Business Inquiries</h2>
                <Button
                  onClick={() => exportCSV("inquiries")}
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-white/10 text-[#E2E8F0] hover:bg-white/5"
                  disabled={!inquiries || inquiries.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              </div>

              {inquiriesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
                </div>
              ) : !inquiries || inquiries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No business inquiries yet.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-white/70 font-mono text-xs">Company</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs">Contact</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs">Email</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs hidden xl:table-cell">Project</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs hidden lg:table-cell">Budget</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs hidden lg:table-cell">Timeline</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inquiries.map((inq) => (
                        <TableRow key={inq.id} className="border-white/5 hover:bg-white/[0.03]">
                          <TableCell className="text-white font-medium">{inq.companyName}</TableCell>
                          <TableCell className="text-muted-foreground">{inq.contactName}</TableCell>
                          <TableCell className="text-muted-foreground">{inq.email}</TableCell>
                          <TableCell className="text-muted-foreground hidden xl:table-cell max-w-[200px] truncate" title={inq.projectDescription || ""}>
                            {inq.projectDescription ? (inq.projectDescription.length > 60 ? inq.projectDescription.slice(0, 60) + "…" : inq.projectDescription) : "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground hidden lg:table-cell">
                            {inq.budget || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground hidden lg:table-cell">
                            {inq.timeline || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
