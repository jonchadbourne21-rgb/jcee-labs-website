import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Shield, Loader2, Plus, Pencil, Trash2, Package, HardHat } from "lucide-react";
import SiteNav from "@/components/SiteNav";

const TRADES = ["hvac", "electrical", "plumbing", "mechanical", "general", "commercial"] as const;

export default function PricingAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"materials" | "labor">("materials");
  const [tradeFilter, setTradeFilter] = useState<string>("");
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [showLaborForm, setShowLaborForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [editingLabor, setEditingLabor] = useState<any>(null);

  const utils = trpc.useUtils();

  const { data: materials, isLoading: materialsLoading } = trpc.bidIndustrial.listMaterials.useQuery(
    tradeFilter ? { trade: tradeFilter } : undefined,
    { enabled: !!user && user.role === "admin" }
  );

  const { data: laborRates, isLoading: laborLoading } = trpc.bidIndustrial.listLaborRates.useQuery(
    tradeFilter ? { trade: tradeFilter } : undefined,
    { enabled: !!user && user.role === "admin" }
  );

  const addMaterial = trpc.bidIndustrial.addMaterial.useMutation({
    onSuccess: () => { utils.bidIndustrial.listMaterials.invalidate(); setShowMaterialForm(false); },
  });
  const updateMaterialMut = trpc.bidIndustrial.updateMaterial.useMutation({
    onSuccess: () => { utils.bidIndustrial.listMaterials.invalidate(); setEditingMaterial(null); },
  });
  const deleteMaterialMut = trpc.bidIndustrial.deleteMaterial.useMutation({
    onSuccess: () => { utils.bidIndustrial.listMaterials.invalidate(); },
  });

  const addLaborRate = trpc.bidIndustrial.addLaborRate.useMutation({
    onSuccess: () => { utils.bidIndustrial.listLaborRates.invalidate(); setShowLaborForm(false); },
  });
  const updateLaborMut = trpc.bidIndustrial.updateLaborRate.useMutation({
    onSuccess: () => { utils.bidIndustrial.listLaborRates.invalidate(); setEditingLabor(null); },
  });
  const deleteLaborMut = trpc.bidIndustrial.deleteLaborRate.useMutation({
    onSuccess: () => { utils.bidIndustrial.listLaborRates.invalidate(); },
  });

  // Auth guards
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090514] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#090514] flex flex-col">
        <SiteNav />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center space-y-6 max-w-md px-4">
            <Shield className="w-16 h-16 text-orange-400 mx-auto" />
            <h1 className="text-2xl font-display font-bold text-white">Admin Access Required</h1>
            <p className="text-muted-foreground">Sign in with an admin account to manage pricing.</p>
            <Button
              onClick={() => { window.location.href = getLoginUrl(); }}
              className="rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#090514] flex flex-col">
        <SiteNav />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center space-y-6 max-w-md px-4">
            <Shield className="w-16 h-16 text-red-400 mx-auto" />
            <h1 className="text-2xl font-display font-bold text-white">Access Denied</h1>
            <p className="text-muted-foreground">Admin privileges required.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090514] flex flex-col">
      <SiteNav />

      <main className="flex-1 pt-28 pb-16 px-4">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-display font-bold text-white">BidIndustrial Pricing</h1>
            <p className="text-muted-foreground">Manage material prices and labor rates for bid calculations.</p>
          </div>

          {/* Tabs + Filter */}
          <div className="flex flex-wrap items-center gap-4 mb-6 border-b border-white/10 pb-4">
            <button
              onClick={() => setActiveTab("materials")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "materials"
                  ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              <Package className="w-4 h-4" />
              Materials ({materials?.length ?? 0})
            </button>
            <button
              onClick={() => setActiveTab("labor")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "labor"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              <HardHat className="w-4 h-4" />
              Labor Rates ({laborRates?.length ?? 0})
            </button>

            <div className="ml-auto">
              <select
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <option value="">All Trades</option>
                {TRADES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Materials Tab */}
          {activeTab === "materials" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Materials Database</h2>
                <Button
                  onClick={() => setShowMaterialForm(true)}
                  className="rounded-lg bg-orange-600 hover:bg-orange-500 text-white"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Material
                </Button>
              </div>

              {materialsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                </div>
              ) : !materials || materials.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No materials added yet. Click "Add Material" to get started.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02] overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-white/70 font-mono text-xs">Trade</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs">Name</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs">Category</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs">Unit</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs">Price</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs hidden lg:table-cell">Supplier</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs hidden lg:table-cell">Part #</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materials.map((mat) => (
                        <TableRow key={mat.id} className="border-white/5 hover:bg-white/[0.03]">
                          <TableCell>
                            <span className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs capitalize">
                              {mat.trade}
                            </span>
                          </TableCell>
                          <TableCell className="text-white font-medium">{mat.name}</TableCell>
                          <TableCell className="text-muted-foreground">{mat.category}</TableCell>
                          <TableCell className="text-muted-foreground">{mat.unit}</TableCell>
                          <TableCell className="text-green-400 font-mono">${mat.unitPrice}</TableCell>
                          <TableCell className="text-muted-foreground hidden lg:table-cell">{mat.supplier || "—"}</TableCell>
                          <TableCell className="text-muted-foreground hidden lg:table-cell font-mono text-xs">{mat.partNumber || "—"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingMaterial(mat)}
                                className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Delete this material?")) {
                                    deleteMaterialMut.mutate({ id: mat.id });
                                  }
                                }}
                                className="p-1.5 rounded-md hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* Labor Rates Tab */}
          {activeTab === "labor" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Labor Rates Database</h2>
                <Button
                  onClick={() => setShowLaborForm(true)}
                  className="rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Labor Rate
                </Button>
              </div>

              {laborLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
              ) : !laborRates || laborRates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <HardHat className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No labor rates added yet. Click "Add Labor Rate" to get started.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02] overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-white/70 font-mono text-xs">Trade</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs">Role</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs">Hourly</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs">Overtime</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs">Region</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs hidden lg:table-cell">Notes</TableHead>
                        <TableHead className="text-white/70 font-mono text-xs w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {laborRates.map((rate) => (
                        <TableRow key={rate.id} className="border-white/5 hover:bg-white/[0.03]">
                          <TableCell>
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs capitalize">
                              {rate.trade}
                            </span>
                          </TableCell>
                          <TableCell className="text-white font-medium">{rate.role}</TableCell>
                          <TableCell className="text-green-400 font-mono">${rate.hourlyRate}/hr</TableCell>
                          <TableCell className="text-yellow-400 font-mono">${rate.overtimeRate}/hr</TableCell>
                          <TableCell className="text-muted-foreground">{rate.region}</TableCell>
                          <TableCell className="text-muted-foreground hidden lg:table-cell max-w-[150px] truncate">{rate.notes || "—"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingLabor(rate)}
                                className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Delete this labor rate?")) {
                                    deleteLaborMut.mutate({ id: rate.id });
                                  }
                                }}
                                className="p-1.5 rounded-md hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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

      {/* Add Material Dialog */}
      <MaterialFormDialog
        open={showMaterialForm}
        onClose={() => setShowMaterialForm(false)}
        onSubmit={(data) => addMaterial.mutate(data)}
        isLoading={addMaterial.isPending}
      />

      {/* Edit Material Dialog */}
      {editingMaterial && (
        <MaterialFormDialog
          open={true}
          onClose={() => setEditingMaterial(null)}
          onSubmit={(data) => updateMaterialMut.mutate({ id: editingMaterial.id, ...data })}
          isLoading={updateMaterialMut.isPending}
          defaultValues={editingMaterial}
          title="Edit Material"
        />
      )}

      {/* Add Labor Rate Dialog */}
      <LaborFormDialog
        open={showLaborForm}
        onClose={() => setShowLaborForm(false)}
        onSubmit={(data) => addLaborRate.mutate(data)}
        isLoading={addLaborRate.isPending}
      />

      {/* Edit Labor Rate Dialog */}
      {editingLabor && (
        <LaborFormDialog
          open={true}
          onClose={() => setEditingLabor(null)}
          onSubmit={(data) => updateLaborMut.mutate({ id: editingLabor.id, ...data })}
          isLoading={updateLaborMut.isPending}
          defaultValues={editingLabor}
          title="Edit Labor Rate"
        />
      )}
    </div>
  );
}

// ─── Material Form Dialog ────────────────────────────────────────────────────

function MaterialFormDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
  defaultValues,
  title = "Add Material",
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  defaultValues?: any;
  title?: string;
}) {
  const [form, setForm] = useState({
    trade: defaultValues?.trade || "hvac",
    name: defaultValues?.name || "",
    category: defaultValues?.category || "",
    unit: defaultValues?.unit || "",
    unitPrice: defaultValues?.unitPrice || "",
    supplier: defaultValues?.supplier || "",
    partNumber: defaultValues?.partNumber || "",
    notes: defaultValues?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      supplier: form.supplier || undefined,
      partNumber: form.partNumber || undefined,
      notes: form.notes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f0a1f] border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Trade *</label>
              <select
                value={form.trade}
                onChange={(e) => setForm({ ...form, trade: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                {TRADES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Category *</label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g., Pipe, Wire, Fittings"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Material Name *</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., 3/4 in Copper Pipe Type L"
              className="bg-white/5 border-white/10 text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Unit *</label>
              <Input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="e.g., linear ft, each, sq ft"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Unit Price ($) *</label>
              <Input
                value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                placeholder="e.g., 4.50"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Supplier</label>
              <Input
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                placeholder="e.g., Ferguson, Grainger"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Part Number</label>
              <Input
                value={form.partNumber}
                onChange={(e) => setForm({ ...form, partNumber: e.target.value })}
                placeholder="e.g., CU-34L-10"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">Notes</label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional notes"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-white/10 text-white hover:bg-white/5">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-orange-600 hover:bg-orange-500 text-white">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {defaultValues ? "Save Changes" : "Add Material"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Labor Rate Form Dialog ──────────────────────────────────────────────────

function LaborFormDialog({
  open,
  onClose,
  onSubmit,
  isLoading,
  defaultValues,
  title = "Add Labor Rate",
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  defaultValues?: any;
  title?: string;
}) {
  const [form, setForm] = useState({
    trade: defaultValues?.trade || "hvac",
    role: defaultValues?.role || "",
    hourlyRate: defaultValues?.hourlyRate || "",
    overtimeRate: defaultValues?.overtimeRate || "",
    region: defaultValues?.region || "National Avg",
    notes: defaultValues?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      region: form.region || undefined,
      notes: form.notes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f0a1f] border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Trade *</label>
              <select
                value={form.trade}
                onChange={(e) => setForm({ ...form, trade: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {TRADES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Role *</label>
              <Input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g., Journeyman, Apprentice"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Hourly Rate ($) *</label>
              <Input
                value={form.hourlyRate}
                onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                placeholder="e.g., 45.00"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Overtime Rate ($) *</label>
              <Input
                value={form.overtimeRate}
                onChange={(e) => setForm({ ...form, overtimeRate: e.target.value })}
                placeholder="e.g., 67.50"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Region</label>
              <Input
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                placeholder="e.g., Dallas-Fort Worth"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Notes</label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-white/10 text-white hover:bg-white/5">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {defaultValues ? "Save Changes" : "Add Labor Rate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
