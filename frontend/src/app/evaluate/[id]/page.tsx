"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Mic2, User, Star, MessageSquare } from "lucide-react";

export default function EvaluatePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { id } = use(params);

  const [ratings, setRatings] = useState({
    content_knowledge: 3,
    organization_structure: 3,
    delivery_voice: 3,
    confidence_body_language: 3,
    audience_engagement: 3,
    time_management: 3,
  });
  const [comments, setComments] = useState("");

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetchAPI(`/sessions/${id}/`);
        if (!res.ok) throw new Error("Failed to load session details");
        const data = await res.json();
        setSession(data);
        if (data.has_evaluated) {
          setSuccess(true);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, [id]);

  const handleRatingChange = (criterion: string, value: number) => {
    setRatings((prev) => ({ ...prev, [criterion]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetchAPI("/evaluations/", {
        method: "POST",
        body: JSON.stringify({
          session: id,
          ...ratings,
          comments,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.non_field_errors) {
          throw new Error(data.non_field_errors[0]);
        }
        throw new Error("Failed to submit evaluation");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
        <div className="w-12 h-12 border-4 border-brand-light border-t-white rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-xl animate-pulse">Loading Evaluation Form...</p>
      </div>
    );
  }
  if (!session) return <div className="text-center mt-20 text-red-500 font-bold bg-red-100 p-8 rounded-xl max-w-md mx-auto">Session not found.</div>;

  const criteriaData = [
    { key: "content_knowledge", label: "Content & Knowledge", icon: "🧠" },
    { key: "organization_structure", label: "Organization & Structure", icon: "📋" },
    { key: "delivery_voice", label: "Delivery & Voice", icon: "🗣️" },
    { key: "confidence_body_language", label: "Confidence & Body Language", icon: "🧍" },
    { key: "audience_engagement", label: "Audience Engagement", icon: "🤝" },
    { key: "time_management", label: "Time Management", icon: "⏱️" },
  ];

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-green-500/10 backdrop-blur-md p-10 rounded-[2rem] shadow-[0_0_40px_rgba(34,197,94,0.2)] text-center border border-green-400/30 animate-fade-in-up relative z-10">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Star className="text-white w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black mb-2 text-white">Already Evaluated</h2>
        <p className="text-green-100 font-medium mb-8">You have successfully submitted your evaluation for this presenter!</p>
        
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl border border-white/20 transition-colors w-full"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-fade-in-up">
      {/* Premium Header Card */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-[2rem] shadow-2xl overflow-hidden mb-8 relative border border-white/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-300 opacity-20 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="p-8 sm:p-10 relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border border-white/30 shadow-inner backdrop-blur-md shrink-0">
            <Mic2 size={40} className="text-white drop-shadow-md" />
          </div>
          <div>
            <span className="bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 inline-block shadow-sm">
              Live Evaluation
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight mb-2">
              {session.weekly_session_details?.theme}
            </h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-100">
              <User size={18} className="opacity-70" />
              <p className="text-lg">
                Presenter: <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-md">{session.presenter_details.first_name} {session.presenter_details.last_name}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-white/10 p-6 sm:p-10 rounded-[2rem] shadow-xl">
        <p className="text-slate-600 dark:text-white/80 font-bold mb-8 text-center sm:text-left">
          Please rate the presenter on a scale of 1 to 5. (1 = Poor, 5 = Excellent)
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-200 p-4 rounded-xl text-sm mb-8 border border-red-200 dark:border-red-500/30 font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {criteriaData.map(({key, label, icon}) => (
              <div key={key} className="bg-slate-50 dark:bg-black/30 p-5 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-white/20 transition-colors group shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{icon}</span>
                  <label className="block text-sm font-bold text-slate-800 dark:text-white tracking-wide">
                    {label}
                  </label>
                </div>
                
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const isSelected = ratings[key as keyof typeof ratings] === val;
                    return (
                      <label 
                        key={val} 
                        className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl cursor-pointer transition-all duration-300 font-bold text-lg
                          ${isSelected 
                            ? 'bg-gradient-to-b from-blue-400 to-blue-600 text-white shadow-[0_4px_15px_rgba(59,130,246,0.4)] scale-105 border border-blue-400' 
                            : 'bg-white dark:bg-white/5 text-slate-400 dark:text-white/40 border border-slate-200 dark:border-transparent hover:bg-slate-100 dark:hover:bg-white/10'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name={key}
                          value={val}
                          checked={isSelected}
                          onChange={() => handleRatingChange(key, val)}
                          className="hidden"
                          required
                        />
                        {val}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 dark:bg-black/30 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="text-slate-400 dark:text-white/60" size={20} />
              <label className="block text-sm font-bold text-slate-800 dark:text-white tracking-wide">
                Additional Comments (Optional)
              </label>
            </div>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-5 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 transition-all outline-none h-32 resize-none custom-scrollbar"
              placeholder="Provide constructive feedback for the presenter..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg py-5 rounded-2xl transition-all shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
            {submitting ? "Submitting..." : "Submit Evaluation"}
          </button>
        </form>
      </div>
    </div>
  );
}
