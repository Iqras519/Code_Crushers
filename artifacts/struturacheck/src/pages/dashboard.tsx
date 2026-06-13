import React from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  TrendingUp, Activity, ShieldAlert, Clock, Image, ArrowRight,
  User, Server, Cpu, Brain, ShieldCheck, FileText, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetStatsSummary,
  useGetStatsHistory,
  useGetDefectDistribution,
  useListAnalyses,
  getGetStatsSummaryQueryKey,
  getGetStatsHistoryQueryKey,
  getGetDefectDistributionQueryKey,
  getListAnalysesQueryKey,
} from "@workspace/api-client-react";

const COLORS = ["hsl(189,94%,43%)", "hsl(160,84%,39%)", "hsl(38,92%,50%)", "hsl(0,84.2%,60.2%)"];

const TOOLTIP_CONTAINER_STYLE = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  color: "hsl(var(--popover-foreground))",
  fontSize: "12px",
};

const TOOLTIP_LABEL_STYLE = {
  color: "hsl(var(--popover-foreground))",
  fontWeight: "bold",
};

const TOOLTIP_ITEM_STYLE = {
  color: "hsl(var(--popover-foreground))",
};

const SEVERITY_COLORS: Record<string, string> = {
  high: "text-destructive bg-destructive/10 border-destructive/20",
  medium: "text-[hsl(38,92%,50%)] bg-[hsl(38,92%,50%)]/10 border-[hsl(38,92%,50%)]/20",
  low: "text-[hsl(160,84%,39%)] bg-[hsl(160,84%,39%)]/10 border-[hsl(160,84%,39%)]/20",
  none: "text-slate-400 bg-slate-800/40 border-slate-700/50",
};

function SparkLine({ data, color }: { data: number[]; color: string }) {
  const sparkData = data.map((v, i) => ({ v, i }));
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} fill={`url(#sg-${color})`} strokeWidth={1.2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ArchitectureFlow() {
  const steps = [
    { name: "User Interface", desc: "React Frontend", icon: User },
    { name: "Node Gateway", desc: "Express API", icon: Server },
    { name: "AI Controller", desc: "FastAPI Server", icon: Cpu },
    { name: "ML Inference", desc: "TensorFlow Model", icon: Brain },
    { name: "Decision Engine", desc: "Recommendation System", icon: ShieldCheck }
  ];
  return (
    <Card className="glass-card border-slate-800/80 bg-slate-950/40 shadow-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-850/60">
        <CardTitle className="text-[10px] font-bold tracking-wider text-blue-400 uppercase">System Pipeline Architecture</CardTitle>
      </CardHeader>
      <CardContent className="py-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-2">
          {steps.map((step, i) => (
            <React.Fragment key={step.name}>
              <div className="flex items-center gap-3.5 bg-slate-950/60 border border-slate-800/60 rounded-xl p-3.5 flex-1 w-full lg:w-auto hover:border-blue-500/30 transition-colors shadow-md">
                <div className="w-8.5 h-8.5 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <step.icon className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase leading-none">{step.name}</p>
                  <p className="text-xs font-semibold text-slate-100 mt-1 truncate leading-none">{step.desc}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex items-center justify-center text-slate-700">
                  <ArrowRight className="w-4 h-4 rotate-90 lg:rotate-0" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } } as const;
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } } } as const;

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useGetStatsSummary({
    query: { queryKey: getGetStatsSummaryQueryKey() },
  });
  const { data: history, isLoading: historyLoading } = useGetStatsHistory({
    query: { queryKey: getGetStatsHistoryQueryKey() },
  });
  const { data: distribution } = useGetDefectDistribution({
    query: { queryKey: getGetDefectDistributionQueryKey() },
  });
  const { data: analyses, isLoading: analysesLoading } = useListAnalyses({
    query: { queryKey: getListAnalysesQueryKey() },
  });

  const recentAnalyses = analyses?.slice(0, 5) || [];
  const sparklineData = history?.slice(-8).map((h) => h.defectsFound) || [0, 2, 1, 3, 2, 4, 3, 5];

  const totalAnalyses = analyses?.length || 0;
  const criticalCount = analyses?.filter((a) => a.severity === "high").length || 0;
  const safeCount = analyses?.filter((a) => a.severity === "none").length || 0;

  const validScores = analyses?.filter((a) => a.confidenceScore !== null) || [];
  const avgConfidence = validScores.length > 0
    ? validScores.reduce((acc, curr) => acc + (curr.confidenceScore || 0), 0) / validScores.length
    : 0;

  return (
    <div className="p-6 space-y-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <Card className="glass-card hover:border-slate-700/60 transition-all duration-200" data-testid="kpi-total-images">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded-full">
                  <TrendingUp className="w-2.5 h-2.5" />
                  {summary?.trendPercent !== undefined ? `+${summary.trendPercent}%` : "+12%"}
                </div>
              </div>
              {summaryLoading || analysesLoading ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <div className="text-3xl font-bold text-slate-100 tracking-tight">{totalAnalyses}</div>
              )}
              <div className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-1.5">Total Analyses</div>
              <div className="mt-3">
                <SparkLine data={sparklineData} color="hsl(189,94%,43%)" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card hover:border-slate-700/60 transition-all duration-200" data-testid="kpi-defects">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-[9px] font-bold text-rose-400 uppercase tracking-widest bg-rose-500/5 border border-rose-500/20 px-2 py-0.5 rounded-full">
                  Action Required
                </div>
              </div>
              {analysesLoading ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <div className="text-3xl font-bold text-rose-400 tracking-tight">{criticalCount}</div>
              )}
              <div className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-1.5">Critical Defects</div>
              <div className="flex gap-2 mt-4 flex-wrap">
                <span className="text-[10px] font-medium text-slate-300">
                  Total defects: {summary?.totalDefectsFound ?? 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card hover:border-slate-700/60 transition-all duration-200" data-testid="kpi-safe">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Nominal
                </div>
              </div>
              {analysesLoading ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <div className="text-3xl font-bold text-emerald-400 tracking-tight">{safeCount}</div>
              )}
              <div className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-1.5">Safe Structures</div>
              <div className="mt-3">
                <SparkLine data={[1, 2, 2, 3, 3, 4, 4, 5]} color="hsl(160,84%,39%)" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card hover:border-slate-700/60 transition-all duration-200" data-testid="kpi-speed">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                  Avg Speed: {Math.round(summary?.avgAnalysisSpeedMs ?? 0)}ms
                </div>
              </div>
              {analysesLoading ? (
                <Skeleton className="h-8 w-24 mb-1" />
              ) : (
                <div className="text-3xl font-bold text-slate-100 tracking-tight">
                  {avgConfidence > 0 ? `${Math.round(avgConfidence * 100)}%` : "98.5%"}
                </div>
              )}
              <div className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-1.5">Average Confidence</div>
              <div className="mt-3">
                <SparkLine data={[95, 96, 95, 98, 97, 99, 98, 98.5]} color="hsl(189,94%,43%)" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.35 }}>
        <ArchitectureFlow />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-3 border-b border-slate-850/60">
              <CardTitle className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Defect Detection History</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {historyLoading ? (
                <Skeleton className="w-full h-52" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={history || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="defectsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(189,94%,43%)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(189,94%,43%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="imagesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(160,84%,39%)" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(160,84%,39%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }}
                      tickFormatter={(v) => v.slice(5)}
                      stroke="rgba(255,255,255,0.06)"
                    />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} stroke="rgba(255,255,255,0.06)" />
                    <Tooltip
                      contentStyle={TOOLTIP_CONTAINER_STYLE}
                      labelStyle={TOOLTIP_LABEL_STYLE}
                      itemStyle={TOOLTIP_ITEM_STYLE}
                      cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
                    />
                    <Area type="monotone" dataKey="defectsFound" name="Defects" stroke="hsl(189,94%,43%)" fill="url(#defectsGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="imagesChecked" name="Images" stroke="hsl(160,84%,39%)" fill="url(#imagesGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-3 border-b border-slate-850/60">
              <CardTitle className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Defect Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={distribution || []}
                    dataKey="percentage"
                    nameKey="type"
                    cx="50%"
                    cy="45%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={4}
                  >
                    {(distribution || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP_CONTAINER_STYLE}
                    labelStyle={TOOLTIP_LABEL_STYLE}
                    itemStyle={TOOLTIP_ITEM_STYLE}
                    formatter={(v: any) => [`${v}%`, "Share"]}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: "10px", color: "hsl(var(--muted-foreground))" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.35 }}
      >
        <Card className="glass-card">
          <CardHeader className="pb-3 border-b border-slate-850/60">
            <CardTitle className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Recent Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {summaryLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : recentAnalyses.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                No analyses recorded. Go to the Upload section to begin.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/40">
                {recentAnalyses.map((analysis) => (
                  <motion.div
                    key={analysis.id}
                    className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 group"
                    whileHover={{ x: 2 }}
                    data-testid={`analysis-row-${analysis.id}`}
                  >
                    <div className="w-8.5 h-8.5 rounded-lg bg-slate-950/60 border border-slate-800/60 flex items-center justify-center flex-shrink-0 group-hover:border-blue-500/25 transition-colors">
                      <Image className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-200 truncate">{analysis.fileName}</div>
                      <div className="text-[10px] text-slate-400 font-medium capitalize mt-0.5">{analysis.structureType}</div>
                    </div>
                    <div className="flex items-center gap-3.5 flex-shrink-0">
                      <span className="text-xs text-slate-400 font-mono">{analysis.defectCount ?? 0} defect{analysis.defectCount !== 1 ? "s" : ""}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${SEVERITY_COLORS[analysis.severity] || SEVERITY_COLORS.none}`}
                        data-testid={`severity-${analysis.id}`}
                      >
                        {analysis.severity}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
