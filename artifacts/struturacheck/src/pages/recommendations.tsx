import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, CheckCircle2, Clock, ChevronDown, ChevronUp,
  FileText, Zap, Calendar, Loader2, ShieldCheck, Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  useListRecommendations,
  useGenerateWorkOrder,
  useSetInspectionReminder,
  getListRecommendationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Recommendation {
  id: number;
  analysisId: number;
  severity: string;
  title: string;
  description: string;
  reasoning: string;
  workOrderGenerated: boolean;
  reminderDate: string | null;
  createdAt: string;
}

const SEV_CONFIG = {
  critical: {
    border: "border-l-4 border-l-destructive",
    badge: "text-destructive bg-destructive/10 border-destructive/20",
    icon: AlertTriangle,
    iconColor: "text-destructive",
    label: "Immediate Action Required",
    dot: "bg-destructive",
  },
  warning: {
    border: "border-l-4 border-l-[hsl(var(--warning))]",
    badge: "text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/20",
    icon: Clock,
    iconColor: "text-[hsl(var(--warning))]",
    label: "Continuous Monitoring",
    dot: "bg-[hsl(var(--warning))]",
  },
  safe: {
    border: "border-l-4 border-l-[hsl(var(--success))]",
    badge: "text-[hsl(var(--success))] bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]/20",
    icon: CheckCircle2,
    iconColor: "text-[hsl(var(--success))]",
    label: "Safe / No Action",
    dot: "bg-[hsl(var(--success))]",
  },
};

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-2 text-[11px] font-mono text-slate-300">
      {lines.map((line, i) => {
        // Headers
        if (line.startsWith("## ")) {
          return (
            <h3 key={i} className="text-[11px] font-semibold text-cyan-400 mt-3.5 flex items-center gap-1">
              <span className="text-slate-500 select-none">&gt;</span> {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h4 key={i} className="text-[11px] font-semibold text-emerald-400 mt-2.5 flex items-center gap-1">
              <span className="text-slate-600 select-none">#</span> {line.slice(4)}
            </h4>
          );
        }
        // Bullet points with bold titles
        if (line.startsWith("- **")) {
          const boldMatch = line.match(/- \*\*(.+?)\*\*(.*)/);
          if (boldMatch) {
            return (
              <div key={i} className="flex items-start gap-2 pl-2">
                <span className="text-cyan-500/80 mt-0.5 shrink-0 select-none">»</span>
                <span>
                  <strong className="text-slate-100 font-semibold">{boldMatch[1]}</strong>
                  <span className="text-slate-300">{boldMatch[2]}</span>
                </span>
              </div>
            );
          }
        }
        // Standard bullet points
        if (line.startsWith("- ")) {
          return (
            <div key={i} className="flex items-start gap-2 pl-2">
              <span className="text-slate-500 mt-0.5 shrink-0 select-none">-</span>
              <span>{line.slice(2)}</span>
            </div>
          );
        }
        // Empty space
        if (line.trim() === "") return <div key={i} className="h-1.5" />;
        // Standard line
        return <p key={i} className="pl-1 text-slate-300 leading-relaxed">{line}</p>;
      })}
    </div>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const [expanded, setExpanded] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const generateWO = useGenerateWorkOrder();
  const setReminder = useSetInspectionReminder();

  const conf = SEV_CONFIG[rec.severity as keyof typeof SEV_CONFIG] || SEV_CONFIG.safe;
  const Icon = conf.icon;

  const handleWorkOrder = () => {
    generateWO.mutate(
      { id: rec.id },
      {
        onSuccess: (res: any) => {
          queryClient.invalidateQueries({ queryKey: getListRecommendationsQueryKey() });
          toast({ title: "Work order generated", description: `Reference: ${res.reference}` });
        },
      }
    );
  };

  const handleReminder = () => {
    if (!reminderDate) return;
    setReminder.mutate(
      { id: rec.id, data: { reminderDate } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListRecommendationsQueryKey() });
          toast({ title: "Reminder set", description: `Inspection scheduled for ${reminderDate}` });
          setReminderDate("");
        },
      }
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-border/80 glass-card ${conf.border} overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-border/100`}
      data-testid={`recommendation-${rec.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${conf.badge} shadow-inner`}>
            <Icon className={`w-4 h-4 ${conf.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${conf.badge}`}>
                {conf.label}
              </span>
              {rec.workOrderGenerated && (
                <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1 select-none">
                  <span className="w-1 h-1 rounded-full bg-primary animate-ping" />
                  Work Order Created
                </span>
              )}
              {rec.reminderDate && (
                <span className="text-[10px] font-semibold text-muted-foreground bg-muted/40 border border-border/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  Reminder: {rec.reminderDate}
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">{rec.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{rec.description}</p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5 mt-4">
              {rec.severity === "critical" && !rec.workOrderGenerated && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs font-semibold px-3.5 shadow-sm hover:shadow active:scale-95 transition-all"
                  onClick={handleWorkOrder}
                  disabled={generateWO.isPending}
                  data-testid={`generate-wo-${rec.id}`}
                >
                  {generateWO.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Zap className="w-3.5 h-3.5 mr-1.5" />}
                  Generate Work Order
                </Button>
              )}
              {rec.severity === "warning" && !rec.reminderDate && (
                <div className="flex gap-2 items-center">
                  <Input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="h-8 text-xs w-36 border-border bg-background/50 focus-visible:ring-1"
                    data-testid={`reminder-date-${rec.id}`}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold px-3 shadow-sm active:scale-95 transition-all"
                    onClick={handleReminder}
                    disabled={!reminderDate || setReminder.isPending}
                    data-testid={`set-reminder-${rec.id}`}
                  >
                    {setReminder.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Calendar className="w-3.5 h-3.5 mr-1.5" />}
                    Set Reminder
                  </Button>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground active:scale-95 transition-all"
                data-testid={`download-report-${rec.id}`}
              >
                <FileText className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                Download PDF Report
              </Button>
            </div>

            {/* Reasoning Accordion */}
            <div className="mt-4 border-t border-border/40 pt-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors select-none"
                data-testid={`toggle-reasoning-${rec.id}`}
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5 text-primary" /> : <ChevronDown className="w-3.5 h-3.5 text-primary" />}
                <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
                AI Inference Log
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2.5 rounded-xl border border-border bg-slate-950 overflow-hidden font-mono shadow-lg">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-border/40 text-[10px] text-muted-foreground select-none">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span>AI_REASONING_LOG.sh</span>
                        </div>
                        <span className="text-[9px] text-muted-foreground/60 uppercase">System Lint: OK</span>
                      </div>
                      <div className="p-3">
                        <MarkdownContent content={rec.reasoning} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </CardContent>
    </motion.div>
  );
}

const SECTION_ORDER = ["critical", "warning", "safe"];

export default function RecommendationsPage() {
  const { data: recommendations, isLoading } = useListRecommendations({
    query: { queryKey: getListRecommendationsQueryKey() },
  });

  const grouped = SECTION_ORDER.reduce<Record<string, Recommendation[]>>((acc, sev) => {
    acc[sev] = (recommendations || []).filter((r) => r.severity === sev) as Recommendation[];
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
      </div>
    );
  }

  const total = recommendations?.length || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header Summary */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">AI Action Recommendations</h1>
          <p className="text-xs text-muted-foreground">
            Defect repair workflows, maintenance schedules, and priority remediation paths.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/30 border border-border/40 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-success" />
            {total} recommendation{total !== 1 ? "s" : ""}
          </div>
          <div className="flex gap-1.5">
            {SECTION_ORDER.map((sev) => {
              const conf = SEV_CONFIG[sev as keyof typeof SEV_CONFIG];
              const count = grouped[sev]?.length || 0;
              if (count === 0) return null;
              return (
                <span key={sev} className={`text-[10px] font-bold px-2 py-1 rounded-full border capitalize ${conf.badge}`}>
                  {count} {sev}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {SECTION_ORDER.map((sev) => {
          const items = grouped[sev];
          if (!items || items.length === 0) return null;
          const conf = SEV_CONFIG[sev as keyof typeof SEV_CONFIG];
          return (
            <motion.div
              key={sev}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${conf.dot} animate-pulse-subtle`} />
                <h2 className="text-xs font-bold text-foreground uppercase tracking-widest">{conf.label}</h2>
                <span className="text-xs text-muted-foreground font-semibold">({items.length})</span>
              </div>
              <div className="space-y-4">
                {items.map((rec) => (
                  <RecommendationCard key={rec.id} rec={rec} />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {total === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground glass-card border-border/80 rounded-2xl p-8">
          <ShieldCheck className="w-12 h-12 mb-3 opacity-30 text-success" />
          <h3 className="text-sm font-bold text-foreground">All Structures Evaluated Clean</h3>
          <p className="text-xs mt-1 text-muted-foreground max-w-xs">
            Analyze structural photos in the uploader dashboard to trigger predictive risk alerts.
          </p>
        </div>
      )}
    </div>
  );
}
