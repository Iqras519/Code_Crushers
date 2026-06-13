import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useGetStatsHistory,
  useGetDefectDistribution,
  useListAnalyses,
  getGetStatsHistoryQueryKey,
  getGetDefectDistributionQueryKey,
  getListAnalysesQueryKey,
} from "@workspace/api-client-react";
import {
  Search, ArrowUpDown, ChevronUp, ChevronDown, Filter, FileText,
  BarChart3, PieChart as PieIcon, RefreshCw, X, ShieldAlert, Layers
} from "lucide-react";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))"
];

const SEV_CLASSES: Record<string, string> = {
  high: "text-destructive bg-destructive/10 border-destructive/20",
  medium: "text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/20",
  low: "text-[hsl(var(--success))] bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]/20",
  none: "text-muted-foreground bg-muted/30 border-border/50",
  completed: "text-[hsl(var(--success))] bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]/20",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md px-3.5 py-2.5 shadow-xl text-xs space-y-1.5 min-w-[150px] animate-in fade-in zoom-in-95 duration-100">
        {label && (
          <p className="font-semibold text-foreground border-b border-border/40 pb-1 mb-1">
            {label}
          </p>
        )}
        {payload.map((item: any, index: number) => {
          const color = item.color || item.payload.fill || "hsl(var(--primary))";
          const name = item.name || item.dataKey;
          const val = item.payload.percentage !== undefined && item.name === item.payload.type
            ? `${item.value}%`
            : item.value;
          return (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                {name}
              </span>
              <span className="font-semibold text-foreground text-right">{val}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [sortField, setSortField] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { data: history, isLoading: historyLoading } = useGetStatsHistory({
    query: { queryKey: getGetStatsHistoryQueryKey() },
  });
  const { data: distribution, isLoading: distLoading } = useGetDefectDistribution({
    query: { queryKey: getGetDefectDistributionQueryKey() },
  });
  const { data: analyses, isLoading: analysesLoading } = useListAnalyses({
    query: { queryKey: getListAnalysesQueryKey() },
  });

  const filtered = (analyses || []).filter((a) => {
    if (severityFilter !== "all" && a.severity !== severityFilter) return false;
    if (typeFilter !== "all" && a.structureType !== typeFilter) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const fileNameMatch = a.fileName?.toLowerCase().includes(q);
      const notesMatch = a.notes?.toLowerCase().includes(q);
      return fileNameMatch || notesMatch;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortField as keyof typeof a];
    let valB = b[sortField as keyof typeof b];

    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    if (typeof valA === "string" && typeof valB === "string") {
      const comparison = valA.localeCompare(valB);
      return sortDirection === "asc" ? comparison : -comparison;
    }

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortableHeader = ({ field, label, align = "left" }: { field: string; label: string; align?: "left" | "right" }) => {
    const isActive = sortField === field;
    return (
      <div
        onClick={() => toggleSort(field)}
        className={`group cursor-pointer flex items-center gap-1 select-none transition-colors hover:text-foreground ${
          align === "right" ? "justify-end text-right" : "justify-start text-left"
        } ${isActive ? "text-foreground font-semibold" : "text-muted-foreground"}`}
      >
        <span>{label}</span>
        <span className="shrink-0 transition-opacity">
          {isActive ? (
            sortDirection === "asc" ? (
              <ChevronUp className="w-3.5 h-3.5 text-primary" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-primary" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 text-muted-foreground/50 transition-opacity" />
          )}
        </span>
      </div>
    );
  };

  const barData = (distribution || []).map((d, i) => ({
    ...d,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Analytics Overview</h1>
        <p className="text-xs text-muted-foreground">
          Deep-dive analysis statistics, pipeline historical trends, and defect severity breakdowns.
        </p>
      </div>

      {/* Full History Chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="glass-card border-border/80">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Defect Detection History</CardTitle>
            </div>
            <CardDescription className="text-[10px]">
              Daily comparison of image processing volumes vs detected defects
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {historyLoading ? (
              <Skeleton className="w-full h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={history || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="defGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="imgGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="defectsFound" name="Defects Found" stroke="hsl(var(--primary))" fill="url(#defGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="imagesChecked" name="Images Checked" stroke="hsl(var(--success))" fill="url(#imgGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
          <Card className="glass-card border-border/80">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Defect Distribution by Type</CardTitle>
              </div>
              <CardDescription className="text-[10px]">
                Breakdown share of identified building, wall, road, and bridge anomalies
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {distLoading ? (
                <Skeleton className="w-full h-52" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={distribution || []}
                      dataKey="percentage"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {(distribution || []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="hsl(var(--card))" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "10px", color: "hsl(var(--foreground))" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}>
          <Card className="glass-card border-border/80">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Analysis Count by Structure</CardTitle>
              </div>
              <CardDescription className="text-[10px]">
                Total database scan records indexed by target structure categories
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {distLoading ? (
                <Skeleton className="w-full h-52" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                    <XAxis dataKey="type" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.15 }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Analyses Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
        <Card className="glass-card border-border/80">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">All Analyses</CardTitle>
                </div>
                <CardDescription className="text-[10px]">
                  Browse, search, and sort all structural AI checks in the workspace.
                </CardDescription>
              </div>
              
              {/* Search & Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search name or notes..."
                    className="pl-8 h-8 text-xs border-border bg-background/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0.5 top-0.5 h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-28 h-8 text-xs border-border bg-background/50" data-testid="filter-type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="bridge">Bridge</SelectItem>
                    <SelectItem value="road">Road</SelectItem>
                    <SelectItem value="wall">Wall</SelectItem>
                    <SelectItem value="building">Building</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-28 h-8 text-xs border-border bg-background/50" data-testid="filter-severity">
                    <SelectValue placeholder="All Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>

                {(severityFilter !== "all" || typeFilter !== "all" || searchQuery !== "") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSeverityFilter("all");
                      setTypeFilter("all");
                      setSearchQuery("");
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Reset filters"
                  >
                    <RefreshCw className="h-3.5 w-3.5 animate-spin-hover" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {analysesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs flex flex-col items-center justify-center gap-2">
                <Search className="w-8 h-8 opacity-20" />
                <p>No analyses match the current search filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-border/40 rounded-xl bg-background/20">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      <th className="py-2.5 px-4 font-semibold text-muted-foreground">
                        <SortableHeader field="fileName" label="File" />
                      </th>
                      <th className="py-2.5 px-4 font-semibold text-muted-foreground">
                        <SortableHeader field="structureType" label="Type" />
                      </th>
                      <th className="py-2.5 px-4 font-semibold text-muted-foreground">
                        <SortableHeader field="severity" label="Severity" />
                      </th>
                      <th className="py-2.5 px-4 font-semibold text-muted-foreground text-right">
                        <SortableHeader field="defectCount" label="Defects" align="right" />
                      </th>
                      <th className="py-2.5 px-4 font-semibold text-muted-foreground text-right">
                        <SortableHeader field="confidenceScore" label="Confidence" align="right" />
                      </th>
                      <th className="py-2.5 px-4 font-semibold text-muted-foreground text-right">
                        <SortableHeader field="analysisSpeedMs" label="Speed" align="right" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {sorted.map((a, i) => (
                        <motion.tr
                          key={a.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15, delay: Math.min(i * 0.02, 0.2) }}
                          className="border-b border-border/40 hover:bg-accent/40 transition-colors"
                          data-testid={`analytics-row-${a.id}`}
                        >
                          <td className="py-3 px-4 text-foreground font-medium truncate max-w-[160px]" title={a.fileName}>
                            <div>
                              <div>{a.fileName}</div>
                              {a.notes && (
                                <div className="text-[10px] text-muted-foreground truncate max-w-[200px]" title={a.notes}>
                                  {a.notes}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 capitalize text-muted-foreground">{a.structureType}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${SEV_CLASSES[a.severity] || SEV_CLASSES.none}`}>
                              {a.severity}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-foreground">
                            {(a.defectCount ?? 0) > 0 ? (
                              <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 py-0 px-2 text-[10px] font-semibold">
                                {a.defectCount}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {a.confidenceScore ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className="font-semibold text-foreground">
                                  {Math.round(a.confidenceScore * 100)}%
                                </span>
                                <div className="w-12 h-1 bg-muted rounded-full overflow-hidden hidden sm:block">
                                  <div
                                    className={`h-full rounded-full ${
                                      a.confidenceScore > 0.8
                                        ? "bg-success"
                                        : a.confidenceScore > 0.5
                                        ? "bg-warning"
                                        : "bg-destructive"
                                    }`}
                                    style={{ width: `${a.confidenceScore * 100}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground">
                            {a.analysisSpeedMs ? `${a.analysisSpeedMs}ms` : "—"}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
