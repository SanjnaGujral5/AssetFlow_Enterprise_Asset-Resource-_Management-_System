import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../../features/auth/useAuth";
import { Chrome, Fingerprint, Lock, Mail, ShieldCheck } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  function onSubmit(data: LoginForm) {
    loginMutation.mutate(data, {
      onSuccess: () => navigate("/"),
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-xl font-bold text-white shadow-lg">
            AF
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Sign in to AssetFlow</h2>
          <p className="mt-2 text-sm text-slate-500">
            Please enter your details to access your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail size={18} className="text-slate-400" />
              </div>
              <input
                type="email"
                {...register("email")}
                className="block w-full rounded-xl border-slate-200 py-2.5 pl-10 text-sm shadow-sm transition-all focus:border-brand-500 focus:ring-brand-500"
                placeholder="you@company.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock size={18} className="text-slate-400" />
              </div>
              <input
                type="password"
                {...register("password")}
                className="block w-full rounded-xl border-slate-200 py-2.5 pl-10 text-sm shadow-sm transition-all focus:border-brand-500 focus:ring-brand-500"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                {...register("rememberMe")}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-brand-600 hover:text-brand-500">
                Forgot password?
              </a>
            </div>
          </div>

          {loginMutation.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ShieldCheck className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {(loginMutation.error as any)?.response?.data?.message || "Invalid credentials"}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="flex w-full justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-60"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm font-medium leading-6">
              <span className="bg-white px-6 text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => alert("SSO integration coming soon!")}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              <Chrome className="h-5 w-5 text-[#4285F4]" />
              Google
            </button>
            <button
              type="button"
              onClick={() => alert("SSO integration coming soon!")}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              <Fingerprint className="h-5 w-5 text-slate-600" />
              Microsoft
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-semibold leading-6 text-brand-600 hover:text-brand-500">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}
