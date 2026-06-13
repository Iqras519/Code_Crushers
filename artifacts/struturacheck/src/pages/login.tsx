import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Github, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin, useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

function MeshBackground() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6,182,212,0.15)" strokeWidth="0.5" />
        </pattern>
        <radialGradient id="glow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="rgba(6,182,212,0.2)" />
          <stop offset="100%" stopColor="rgba(6,182,212,0)" />
        </radialGradient>
      </defs>
      <rect width="400" height="600" fill="url(#grid)" />
      <rect width="400" height="600" fill="url(#glow)" />
      {/* Structural lines */}
      <motion.line
        x1="50" y1="100" x2="350" y2="100"
        stroke="rgba(6,182,212,0.3)" strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />
      <motion.line
        x1="50" y1="200" x2="350" y2="200"
        stroke="rgba(6,182,212,0.2)" strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.5 }}
      />
      <motion.line
        x1="50" y1="300" x2="350" y2="300"
        stroke="rgba(6,182,212,0.2)" strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 1 }}
      />
      {/* Vertical grid lines */}
      <motion.line
        x1="100" y1="50" x2="100" y2="550"
        stroke="rgba(6,182,212,0.2)" strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.3 }}
      />
      <motion.line
        x1="200" y1="50" x2="200" y2="550"
        stroke="rgba(6,182,212,0.3)" strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.8 }}
      />
      <motion.line
        x1="300" y1="50" x2="300" y2="550"
        stroke="rgba(6,182,212,0.2)" strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 1.2 }}
      />
      {/* Scan line */}
      <motion.rect
        x="0" y="0" width="400" height="2"
        fill="rgba(6,182,212,0.4)"
        initial={{ y: 0 }} animate={{ y: 600 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      {/* Corner markers */}
      <g stroke="rgba(6,182,212,0.6)" strokeWidth="1.5" fill="none">
        <path d="M 60 80 L 60 60 L 80 60" />
        <path d="M 320 80 L 320 60 L 340 60" />
        <path d="M 60 520 L 60 540 L 80 540" />
        <path d="M 320 520 L 320 540 L 340 540" />
      </g>
      {/* Data points */}
      {[
        [120, 150], [200, 180], [280, 140], [160, 250], [240, 220], [300, 280], [140, 350], [220, 320],
      ].map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x} cy={y} r="3"
          fill="rgba(6,182,212,0.6)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "Structural Engineer" },
  });

  const onLogin = async (data: LoginForm) => {
    loginMutation.mutate(
      { data },
      {
        onSuccess: (res: any) => {
          login(res.token, res.user);
          setLocation("/dashboard");
        },
        onError: () => {
          toast({ title: "Login failed", description: "Invalid email or password", variant: "destructive" });
        },
      }
    );
  };

  const onRegister = async (data: RegisterForm) => {
    registerMutation.mutate(
      { data },
      {
        onSuccess: (res: any) => {
          login(res.token, res.user);
          setLocation("/dashboard");
        },
        onError: (err: any) => {
          toast({ title: "Registration failed", description: err?.data?.error || "Please try again", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex dark">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 relative bg-[hsl(220,15%,8%)] overflow-hidden items-center justify-center p-12">
        <MeshBackground />
        <div className="relative z-10 text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              VisionBuild
            </h1>
            <p className="text-lg text-[hsl(215,20%,65%)] mb-8 leading-relaxed">
              AI-powered structural defect detection for engineers who demand precision.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { value: "99.2%", label: "Detection Accuracy" },
                { value: "< 500ms", label: "Analysis Speed" },
                { value: "50K+", label: "Images Analyzed" },
              ].map(({ value, label }) => (
                <motion.div
                  key={label}
                  className="bg-white/5 border border-white/10 rounded-xl p-3"
                  whileHover={{ scale: 1.03, borderColor: "rgba(6,182,212,0.4)" }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="text-xl font-bold text-primary">{value}</div>
                  <div className="text-xs text-[hsl(215,20%,55%)] mt-1">{label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 lg:max-w-[480px] flex items-center justify-center p-8 bg-[hsl(220,15%,10%)]">
        <div className="w-full max-w-sm">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-white">VisionBuild</span>
          </div>

          {/* Tab Toggle */}
          <div className="flex gap-1 p-1 bg-[hsl(220,15%,15%)] rounded-xl mb-8">
            {["Sign In", "Create Account"].map((tab, i) => (
              <button
                key={tab}
                onClick={() => setIsLogin(i === 0)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isLogin === (i === 0)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-[hsl(215,20%,60%)] hover:text-white"
                }`}
                data-testid={i === 0 ? "tab-signin" : "tab-register"}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
                <p className="text-sm text-[hsl(215,20%,55%)] mb-6">Sign in to your account</p>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[hsl(215,20%,70%)] text-xs font-medium uppercase tracking-wide">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="username"
                      placeholder="engineer@company.com"
                      className="bg-[hsl(220,15%,15%)] border-[hsl(220,15%,25%)] text-white placeholder:text-[hsl(215,20%,40%)] focus:border-primary focus:ring-1 focus:ring-primary"
                      data-testid="input-email"
                      {...loginForm.register("email")}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-[hsl(215,20%,70%)] text-xs font-medium uppercase tracking-wide">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="bg-[hsl(220,15%,15%)] border-[hsl(220,15%,25%)] text-white placeholder:text-[hsl(215,20%,40%)] focus:border-primary focus:ring-1 focus:ring-primary pr-10"
                        data-testid="input-password"
                        {...loginForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(215,20%,50%)] hover:text-white transition-colors"
                        data-testid="toggle-password"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    disabled={loginMutation.isPending}
                    data-testid="button-signin"
                  >
                    {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Sign In
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[hsl(220,15%,22%)]" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-[hsl(220,15%,10%)] text-[hsl(215,20%,45%)]">or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: "G", label: "Google" },
                    { icon: <Github className="w-4 h-4" />, label: "GitHub" },
                  ].map(({ icon, label }) => (
                    <button
                      key={label}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-[hsl(220,15%,25%)] text-[hsl(215,20%,70%)] hover:border-[hsl(220,15%,35%)] hover:text-white transition-all text-sm font-medium"
                      data-testid={`oauth-${label.toLowerCase()}`}
                    >
                      {typeof icon === "string" ? (
                        <span className="font-bold text-base">{icon}</span>
                      ) : icon}
                      {label}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
                <p className="text-sm text-[hsl(215,20%,55%)] mb-6">Join the VisionBuild platform</p>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[hsl(215,20%,70%)] text-xs font-medium uppercase tracking-wide">Full Name</Label>
                    <Input
                      placeholder="Jane Smith"
                      className="bg-[hsl(220,15%,15%)] border-[hsl(220,15%,25%)] text-white placeholder:text-[hsl(215,20%,40%)] focus:border-primary"
                      data-testid="input-name"
                      {...registerForm.register("name")}
                    />
                    {registerForm.formState.errors.name && (
                      <p className="text-xs text-destructive">{registerForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[hsl(215,20%,70%)] text-xs font-medium uppercase tracking-wide">Email</Label>
                    <Input
                      type="email"
                      autoComplete="username"
                      placeholder="engineer@company.com"
                      className="bg-[hsl(220,15%,15%)] border-[hsl(220,15%,25%)] text-white placeholder:text-[hsl(215,20%,40%)] focus:border-primary"
                      data-testid="input-register-email"
                      {...registerForm.register("email")}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-xs text-destructive">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[hsl(215,20%,70%)] text-xs font-medium uppercase tracking-wide">Role</Label>
                    <Input
                      placeholder="Structural Engineer"
                      className="bg-[hsl(220,15%,15%)] border-[hsl(220,15%,25%)] text-white placeholder:text-[hsl(215,20%,40%)] focus:border-primary"
                      data-testid="input-role"
                      {...registerForm.register("role")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[hsl(215,20%,70%)] text-xs font-medium uppercase tracking-wide">Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Min. 6 characters"
                        className="bg-[hsl(220,15%,15%)] border-[hsl(220,15%,25%)] text-white placeholder:text-[hsl(215,20%,40%)] focus:border-primary pr-10"
                        data-testid="input-register-password"
                        {...registerForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(215,20%,50%)] hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-xs text-destructive">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    disabled={registerMutation.isPending}
                    data-testid="button-register"
                  >
                    {registerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create Account
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
