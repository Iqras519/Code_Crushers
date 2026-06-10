import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, CheckCircle2, Clock, ChevronDown, ChevronUp,
  FileText, Zap, Calendar, Loader2, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    badge: "text-destructive bg-destructive/10 border-destructive/30",
    icon: AlertTriangle,
    iconColor: "text-destructive",
    label: "Immediate Action Required",
    dot: "bg-destructive",
  },
  warning: {
    border: "border-l-4 border-l-[hsl(38,92%,50%)]",
    badge: "text-[hsl(38,92%,50%)] bg-[hsl(38,92%,50%)]/10 border-[hsl(38,92%,50%)]/30",
    icon: Clock,
    iconColor: "text-[hsl(38,92%,50%)]",
    label: "Continuous Monitoring",
    dot: "bg-[hsl(38,92%,50%)]",
  },
  safe: {
    border: "border-l-4 border-l-[hsl(160,84%,39%)]",
    badge: "text-[hsl(160,84%,39%)] bg-[hsl(160,84%,39%)]/10 border-[hsl(160,84%,39%)]/30",
    icon: CheckCircle2,
    iconColor: "text-[hsl(160,84%,39%)]",
    label: "Safe / No Action",
    dot: "bg-[hsl(160,84%,39%)]",
  },
};

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5 text-xs text-muted-foreground">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) return <h3 key={i} className="text-sm font-semibold text-foreground mt-2">{line.slice(3)}</h3>;
        if (line.startsWith("### ")) return <h4 key={i} className="text-xs font-semibold text-foreground/80 mt-1.5">{line.slice(4)}</h4>;
        if (line.startsWith("- **")) {
          const match = line.match(/- \*\*(.+?)\*\*/);
          return <div key={i} className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span><span><strong className="text-foreground">{match?.[1]}</strong></span></div>;
        }
        if (line.startsWith("- ")) return <div key={i} className="flex items-start gap-1.5"><span className="text-muted-foreground mt-0.5">•</span><span>{line.slice(2)}</span></div>;
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i}>{line}</p>;
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
      className={`rounded-xl border border-border bg-card ${conf.border} overflow-hidden`}
      data-testid={`recommendation-${rec.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${conf.badge}`}>
            <Icon className={`w-4 h-4 ${conf.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${conf.badge}`}>
                {conf.label}
              </span>
              {rec.workOrderGenerated && (
                <span className="text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  Work Order Created
                </span>
              )}
              {rec.reminderDate && (
                <span className="text-xs text-muted-foreground">
                  Reminder: {rec.reminderDate}
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-foreground">{rec.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{rec.description}</p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {rec.severity === "critical" && !rec.workOrderGenerated && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-xs"
                  onClick={handleWorkOrder}
                  disabled={generateWO.isPending}
                  data-testid={`generate-wo-${rec.id}`}
                >
                  {generateWO.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
                  Generate Work Order
                </Button>
              )}
              {rec.severity === "warning" && !rec.reminderDate && (
                <div className="flex gap-1.5 items-center">
                  <Input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="h-7 text-xs w-36"
                    data-testid={`reminder-date-${rec.id}`}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={handleReminder}
                    disabled={!reminderDate || setReminder.isPending}
                    data-testid={`set-reminder-${rec.id}`}
                  >
                    {setReminder.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Calendar className="w-3 h-3 mr-1" />}
                    Set Reminder
                  </Button>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                data-testid={`download-report-${rec.id}`}
              >
                <FileText className="w-3 h-3 mr-1" />
                Download PDF Report
              </Button>
            </div>

            {/* Reasoning Accordion */}
            <div className="mt-3 border-t border-border pt-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`toggle-reasoning-${rec.id}`}
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                AI Reasoning
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
                    <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-border">
                      <MarkdownContent content={rec.reasoning} />
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
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    );
  }

  const total = recommendations?.length || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header summary */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="w-4 h-4" />
          {total} recommendation{total !== 1 ? "s" : ""}
        </div>
        <div className="flex gap-2">
          {SECTION_ORDER.map((sev) => {
            const conf = SEV_CONFIG[sev as keyof typeof SEV_CONFIG];
            const count = grouped[sev]?.length || 0;
            if (count === 0) return null;
            return (
              <span key={sev} className={`text-xs px-2 py-0.5 rounded-full border ${conf.badge}`}>
                {count} {sev}
              </span>
            );
          })}
        </div>
      </div>

      {/* Sections */}
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
              <div className={`w-2 h-2 rounded-full ${conf.dot}`} />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">{conf.label}</h2>
              <span className="text-xs text-muted-foreground">({items.length})</span>
            </div>
            <div className="space-y-3">
              {items.map((rec) => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))}
            </div>
          </motion.div>
        );
      })}

      {total === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
          <ShieldCheck className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No recommendations yet</p>
          <p className="text-xs mt-1">Analyze images to generate AI recommendations</p>
        </div>
      )}
    </div>
  );
}
