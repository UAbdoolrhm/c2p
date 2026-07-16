"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { User, ArrowRight, ShieldCheck, UserPlus, Type } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isRegistering ? "/auth/register/" : "/auth/login/";
      const bodyData = isRegistering 
        ? { username, first_name: firstName, last_name: lastName }
        : { username };

      const res = await fetchAPI(endpoint, {
        method: "POST",
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "An error occurred. Please try again.");
      }

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user_role", data.role || "STUDENT");
      if (data.username) {
        localStorage.setItem("username", data.username);
      }

      if (data.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#f4f7fb] dark:bg-[#0B0F24] transition-colors duration-500">
      
      {/* Abstract Mesh Gradient & Grid Background */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-brand-light/30 dark:bg-indigo-600/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[25rem] h-[25rem] bg-blue-400/20 dark:bg-brand-blue/30 rounded-full blur-[80px] mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>

      <div className="animate-fade-in-up z-10 w-full max-w-md px-4 py-4">
        {/* Ultra-Premium Glass Card with asymmetric inner borders */}
        <div className="relative bg-white/60 dark:bg-[#12183A]/60 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-1">
          {/* Inner border gradient to simulate glass edge */}
          <div className="absolute inset-0 rounded-[2rem] border-[1.5px] border-white/50 dark:border-white/10 pointer-events-none [mask-image:linear-gradient(135deg,black,transparent)]"></div>
          
          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center mb-5 relative">
              
              {/* Animated Logo Container */}
              <div className="relative group cursor-default">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <img 
                  src="/logo.png" 
                  alt="C2P Logo" 
                  className="h-12 w-auto relative z-10 drop-shadow-xl bg-white p-2 rounded-xl mb-4 transform transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1 text-center">
                {isRegistering ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-brand-blue dark:text-indigo-400" />
                Secure Evaluation Portal
              </p>
            </div>
            
            {/* Toggle Switch */}
            <div className="flex bg-slate-200/50 dark:bg-black/30 p-1 rounded-xl mb-5 relative z-10">
              <button
                type="button"
                onClick={() => { setIsRegistering(false); setError(""); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${!isRegistering ? 'bg-white dark:bg-[#1C247B] text-brand-blue dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegistering(true); setError(""); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${isRegistering ? 'bg-white dark:bg-[#1C247B] text-brand-blue dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="bg-red-50/80 dark:bg-red-500/10 backdrop-blur-md text-red-600 dark:text-red-400 p-3 rounded-xl text-xs mb-4 border border-red-200/50 dark:border-red-500/20 flex items-center shadow-sm relative z-10">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              
              {isRegistering && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="group animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pl-1">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-blue dark:group-focus-within:text-indigo-400 transition-colors">
                        <Type size={16} strokeWidth={2.5} />
                      </div>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required={isRegistering}
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/70 dark:bg-black/20 border border-slate-200/60 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-brand-blue/15 dark:focus:ring-indigo-500/20 focus:border-brand-blue/50 dark:focus:border-indigo-400/50 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                        placeholder="e.g. John"
                      />
                    </div>
                  </div>
                  <div className="group animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pl-1">
                      Surname
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-blue dark:group-focus-within:text-indigo-400 transition-colors">
                        <Type size={16} strokeWidth={2.5} />
                      </div>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required={isRegistering}
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/70 dark:bg-black/20 border border-slate-200/60 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-brand-blue/15 dark:focus:ring-indigo-500/20 focus:border-brand-blue/50 dark:focus:border-indigo-400/50 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                        placeholder="e.g. Doe"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-brand-light uppercase tracking-wider mb-2">Reg Number</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/70 dark:bg-black/20 border border-slate-200 dark:border-white/20 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 transition-all outline-none shadow-inner"
                    placeholder="Enter your Reg Number"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative overflow-hidden group w-full flex justify-center items-center gap-2 bg-gradient-to-r from-brand-blue to-indigo-600 hover:from-brand-hover hover:to-brand-blue text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-[0_8px_20px_rgb(28,36,123,0.3)] hover:shadow-[0_12px_25px_rgb(28,36,123,0.45)] dark:shadow-[0_8px_20px_rgb(79,70,229,0.25)] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {/* Button Shine Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                  
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="text-sm tracking-wide">
                        {isRegistering ? "Create Account" : "Sign In"}
                      </span>
                      {isRegistering ? (
                        <UserPlus size={16} className="group-hover:scale-110 transition-transform" />
                      ) : (
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Footer Text */}
        <p className="text-center mt-6 text-[10px] sm:text-xs font-medium text-slate-500/80 dark:text-slate-400/80 uppercase tracking-widest relative z-10">
          Powered by C2P interns
        </p>
      </div>
    </div>
  );
}
