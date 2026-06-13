import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle2, AlertTriangle, ShieldCheck, Loader2, Trash2, FileImage, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateAnalysis, useDeleteAnalysis, getListAnalysesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface FileItem {
  file: File;
  id: string;
  preview: string;
}

interface AnalysisResult {
  id: number;
  fileName: string;
  structureType: string;
  severity: string;
  defectCount: number | null;
  confidenceScore: number | null;
  analysisSpeedMs: number | null;
  defectTypes: string | null;
}

const STEPS = [
  "Uploading image...",
  "Analyzing pixels...",
  "Running AI model...",
  "Generating report...",
  "Complete!",
];

const SEVERITY_CONFIG: Record<string, { color: string; icon: typeof CheckCircle2; label: string }> = {
  high: { color: "text-destructive border-destructive/40 bg-destructive/10", icon: AlertTriangle, label: "High Severity" },
  medium: { color: "text-[hsl(38,92%,50%)] border-[hsl(38,92%,50%)]/40 bg-[hsl(38,92%,50%)]/10", icon: AlertTriangle, label: "Medium Severity" },
  low: { color: "text-[hsl(160,84%,39%)] border-[hsl(160,84%,39%)]/40 bg-[hsl(160,84%,39%)]/10", icon: AlertTriangle, label: "Low Severity" },
  none: { color: "text-[hsl(160,84%,39%)] border-[hsl(160,84%,39%)]/40 bg-[hsl(160,84%,39%)]/10", icon: ShieldCheck, label: "No Defects" },
};

export default function UploadPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [structureType, setStructureType] = useState("bridge");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createAnalysis = useCreateAnalysis();
  const deleteAnalysis = useDeleteAnalysis();

  const addFiles = useCallback((newFiles: File[]) => {
    const imageFiles = newFiles.filter((f) => f.type.startsWith("image/"));
    const items: FileItem[] = imageFiles.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}`,
      preview: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...items].slice(0, 4));
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.id !== id);
    });
  };

  const simulateProgress = () =>
    new Promise<void>((resolve) => {
      let step = 0;
      let prog = 0;
      const interval = setInterval(() => {
        prog += Math.random() * 18 + 8;
        const newStep = Math.min(Math.floor(prog / 20), STEPS.length - 1);
        setCurrentStep(newStep);
        setProgress(Math.min(prog, 95));
        if (prog >= 95) {
          clearInterval(interval);
          resolve();
        }
      }, 400);
    });

  const handleAnalyze = async () => {
    if (files.length === 0) {
      toast({ title: "No files selected", description: "Please upload at least one image", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    setProgress(0);
    setCurrentStep(0);
    setResult(null);

    const file = files[0].file;
    const getBase64 = (f: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(f);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

    let imageData: string | undefined;
    try {
      imageData = await getBase64(file);
    } catch (err) {
      toast({ title: "File read error", description: "Failed to read the image file", variant: "destructive" });
      setIsAnalyzing(false);
      return;
    }

    await simulateProgress();

    const fileName = file.name;
    createAnalysis.mutate(
      { data: { fileName, structureType, imageData } },
      {
        onSuccess: (res: any) => {
          setProgress(100);
          setCurrentStep(STEPS.length - 1);
          setTimeout(() => {
            setIsAnalyzing(false);
            setResult(res);
            queryClient.invalidateQueries({ queryKey: getListAnalysesQueryKey() });
          }, 500);
        },
        onError: () => {
          setIsAnalyzing(false);
          setProgress(0);
          toast({ title: "Analysis failed", description: "Please try again", variant: "destructive" });
        },
      }
    );
  };

  const handleDelete = () => {
    if (!result) return;
    deleteAnalysis.mutate(
      { id: result.id },
      {
        onSuccess: () => {
          setResult(null);
          setFiles([]);
          setProgress(0);
          queryClient.invalidateQueries({ queryKey: getListAnalysesQueryKey() });
          toast({ title: "Analysis deleted" });
        },
      }
    );
  };

  const sevConf = SEVERITY_CONFIG[result?.severity || "none"] || SEVERITY_CONFIG.none;
  const SevIcon = sevConf.icon;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Zone & Setup */}
        <div className="space-y-5">
          {/* Drag & Drop Zone */}
          <motion.div
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
            animate={{
              borderColor: isDragging ? "#2563EB" : "rgba(255, 255, 255, 0.08)",
              backgroundColor: isDragging ? "rgba(37, 99, 235, 0.04)" : "rgba(30, 41, 59, 0.2)",
              boxShadow: isDragging ? "0 0 32px rgba(37, 99, 235, 0.15)" : "none",
            }}
            className="border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer min-h-[260px] transition-all glass-card engineering-grid hover:border-slate-700/50"
            data-testid="dropzone"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => addFiles(Array.from(e.target.files || []))}
            />
            <motion.div
              animate={{ scale: isDragging ? 1.08 : 1 }}
              className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5 shadow-inner"
            >
              <Upload className={`w-6 h-6 transition-colors duration-200 ${isDragging ? "text-blue-400" : "text-slate-400"}`} />
            </motion.div>
            <p className="text-sm font-semibold text-slate-200 text-center">
              {isDragging ? "Drop images here" : "Drag & drop structural inspection images"}
            </p>
            <p className="text-xs text-slate-400 mt-1.5 text-center">or click to browse local files</p>
            <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-4">PNG, JPG, WEBP • Max 10MB</p>
          </motion.div>

          {/* Structure Selection */}
          <div className="flex items-center gap-4 bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
              Inspection Target
            </label>
            <Select value={structureType} onValueChange={setStructureType} disabled={isAnalyzing}>
              <SelectTrigger className="flex-1 bg-slate-900 border-slate-800 text-slate-200 rounded-lg h-9" data-testid="structure-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-200 rounded-lg">
                <SelectItem value="bridge">Bridge Beam</SelectItem>
                <SelectItem value="road">Roadway / Pavement</SelectItem>
                <SelectItem value="wall">Retaining Wall</SelectItem>
                <SelectItem value="building">Building Facade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selected Files */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {files.map((f) => (
                  <motion.div
                    key={f.id}
                    layout
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-800/60 bg-slate-950/40"
                    data-testid={`file-item-${f.id}`}
                  >
                    <img src={f.preview} alt={f.file.name} className="w-11 h-11 object-cover rounded-lg border border-slate-800/80 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{f.file.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{(f.file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                      className="p-1.5 hover:bg-slate-800/60 rounded-lg text-slate-400 hover:text-rose-400 transition-all"
                      disabled={isAnalyzing}
                      data-testid={`remove-file-${f.id}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || files.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 rounded-xl transition-all shadow-lg shadow-blue-500/10"
            data-testid="button-analyze"
          >
            {isAnalyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Running Inference Pipeline...</>
            ) : (
              <><FileImage className="w-4 h-4 mr-2" />Run AI Defect Scan</>
            )}
          </Button>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {/* Stepper Loader */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="glass-card">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-4.5 h-4.5 animate-spin text-blue-400" />
                        <span className="text-sm font-semibold text-slate-200">{STEPS[currentStep]}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-400">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-slate-800 [&>div]:bg-blue-500" />
                    
                    {/* Pulsing Stepper Bullet Marks */}
                    <div className="flex items-center justify-between pt-1">
                      {STEPS.map((s, i) => {
                        const isCurrent = i === currentStep;
                        const isPast = i < currentStep;
                        return (
                          <div
                            key={s}
                            className={`flex flex-col items-center flex-1 relative ${
                              isCurrent ? "text-blue-400 font-bold" : isPast ? "text-emerald-400" : "text-slate-600"
                            }`}
                          >
                            <span className="text-[10px] font-mono mb-1">{i + 1}</span>
                            <div className={`w-2 h-2 rounded-full border ${
                              isCurrent ? "bg-blue-500 border-blue-400 animate-pulse-subtle" : isPast ? "bg-emerald-500 border-emerald-400" : "bg-transparent border-slate-700"
                            }`} />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scan Result Details */}
          <AnimatePresence>
            {result && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
                data-testid="analysis-result"
              >
                {/* Visual Analysis View */}
                <Card className="glass-card">
                  <CardHeader className="pb-3 border-b border-slate-850/60">
                    <CardTitle className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Analysis Output comparison</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <div className="grid grid-cols-2 gap-4">
                      {files[0] && (
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Source Capture</p>
                          <img
                            src={files[0].preview}
                            alt="Original"
                            className="w-full h-36 object-cover rounded-xl border border-slate-800"
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">AI Filter Mask</p>
                        <div
                          className={`w-full h-36 rounded-xl border-2 ${sevConf.color} flex items-center justify-center transition-all`}
                          data-testid="ai-masked-image"
                        >
                          <div className="text-center p-3">
                            <SevIcon className="w-7 h-7 mx-auto mb-1.5 opacity-90" />
                            <p className="text-xs font-bold leading-none">{result.defectCount ?? 0} defect{result.defectCount !== 1 ? "s" : ""}</p>
                            <p className="text-[9px] font-semibold tracking-wider uppercase text-slate-400 mt-1">{result.structureType}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Metrics Breakdown */}
                <Card className="glass-card">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize tracking-wider ${sevConf.color}`}>
                        {sevConf.label}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{result.analysisSpeedMs}ms</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/50">
                        <div className="text-xl font-bold text-slate-100 tracking-tight">{result.defectCount ?? 0}</div>
                        <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Defects</div>
                      </div>
                      <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/50">
                        <div className="text-xl font-bold text-slate-100 tracking-tight">
                          {result.confidenceScore ? `${Math.round(result.confidenceScore * 100)}%` : "—"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Confidence</div>
                      </div>
                      <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/50">
                        <div className="text-sm font-bold text-slate-100 tracking-tight capitalize py-1 truncate">{result.structureType}</div>
                        <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Target</div>
                      </div>
                    </div>

                    {/* Confidence Meter */}
                    {result.confidenceScore !== null && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <span>AI Classification Confidence</span>
                          <span>{Math.round(result.confidenceScore * 100)}%</span>
                        </div>
                        <Progress value={result.confidenceScore * 100} className="h-1.5 bg-slate-850 [&>div]:bg-gradient-to-r [&>div]:from-blue-600 [&>div]:to-cyan-400" />
                      </div>
                    )}

                    {result.defectTypes && JSON.parse(result.defectTypes).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {JSON.parse(result.defectTypes).map((dt: string) => (
                          <Badge key={dt} variant="outline" className="text-[10px] bg-slate-900 border-slate-800 text-slate-300 font-medium tracking-wide uppercase px-2 py-0.5 rounded-lg capitalize">
                            {dt.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
                      onClick={handleDelete}
                      disabled={deleteAnalysis.isPending}
                      data-testid="button-delete-analysis"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Remove Inspection Record
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!result && !isAnalyzing && (
            <div className="flex flex-col items-center justify-center h-[280px] text-center border border-dashed border-slate-800 rounded-2xl glass-card bg-slate-950/20">
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-3 text-slate-500">
                <FileImage className="w-5 h-5 opacity-40" />
              </div>
              <p className="text-sm font-semibold text-slate-300">Scan diagnostics pending</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Upload a structure photograph and trigger scanning to see classification data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
