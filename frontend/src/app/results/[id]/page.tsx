"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { use } from "react";
import { ArrowLeft, Trophy, Medal, Users, ListOrdered } from "lucide-react";

export default function GlobalLeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const weeklySessionId = unwrappedParams.id;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem("user_role") === "ADMIN");
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetchAPI(`/weekly_sessions/${weeklySessionId}/leaderboard/`);
      if (res.ok) {
        setData(await res.json());
      } else {
        if (res.status === 401) router.push("/");
        setError("Could not load leaderboard.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
    }, 3000);
    return () => clearInterval(intervalId);
  }, [weeklySessionId, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-white rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-xl animate-pulse">Loading Leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-400 font-bold">{error}</div>;
  }

  const sortedLeaderboard = data.leaderboard;
  const top3 = sortedLeaderboard.slice(0, 3);

  const getPodiumStyle = (index: number) => {
    switch(index) {
      case 0: return "bg-gradient-to-t from-yellow-500 to-yellow-300 border-yellow-200 text-yellow-900 h-48"; // Gold
      case 1: return "bg-gradient-to-t from-gray-300 to-gray-100 border-gray-100 text-gray-800 h-40"; // Silver
      case 2: return "bg-gradient-to-t from-orange-500 to-orange-300 border-orange-200 text-orange-950 h-32"; // Bronze
      default: return "";
    }
  };

  const getListRankStyle = (index: number) => {
    switch(index) {
      case 0: return "bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-300 dark:from-yellow-900/40 dark:to-yellow-800/20 dark:border-yellow-700";
      case 1: return "bg-gradient-to-r from-slate-100 to-slate-50 border-slate-300 dark:from-slate-800/60 dark:to-slate-800/30 dark:border-slate-600";
      case 2: return "bg-gradient-to-r from-orange-100 to-orange-50 border-orange-300 dark:from-orange-900/40 dark:to-orange-800/20 dark:border-orange-800";
      default: return "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700";
    }
  };

  const getRankIcon = (index: number) => {
    switch(index) {
      case 0: return <Trophy size={28} className="text-yellow-600 dark:text-yellow-400 drop-shadow-sm" />;
      case 1: return <Medal size={28} className="text-slate-500 dark:text-slate-300 drop-shadow-sm" />;
      case 2: return <Medal size={28} className="text-orange-700 dark:text-orange-400 drop-shadow-sm" />;
      default: return <span className="font-black text-xl text-slate-400 dark:text-slate-500">{index + 1}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in-up pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(isAdmin ? "/admin" : "/dashboard")}
          className="flex items-center gap-2 text-white hover:text-brand-light transition-colors font-bold bg-white/10 px-4 py-2 rounded-xl"
        >
          <ArrowLeft size={20} /> Back to {isAdmin ? "Admin" : "Dashboard"}
        </button>
      </div>

      <div className="text-center space-y-2 mb-16">
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Global Leaderboard</h1>
        <p className="text-xl text-brand-light font-medium uppercase tracking-widest mt-2">
          {data.weekly_session}
        </p>
      </div>

      {sortedLeaderboard.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 text-center border border-white/20 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-2">No Presenters</h3>
          <p className="text-slate-400">There are no presenters scheduled for this weekly session.</p>
        </div>
      ) : (
        <>
          {/* THE PODIUM FOR TOP 3 */}
          <div className="flex justify-center items-end gap-2 sm:gap-6 mb-20 px-2">
            {/* 2nd Place */}
            {top3[1] && (
              <div className="flex flex-col items-center w-28 sm:w-40 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-center mb-4">
                  <h3 className="text-sm sm:text-lg font-black text-white truncate w-full">{top3[1].presenter_name}</h3>
                  <p className="text-xs sm:text-sm font-bold text-gray-400">{top3[1].overall_score > 0 ? top3[1].overall_score.toFixed(2) : '-'}</p>
                </div>
                <div className={`w-full rounded-t-2xl shadow-2xl flex flex-col items-center justify-start pt-6 border-t border-l border-r ${getPodiumStyle(1)}`}>
                  <Medal size={40} className="text-gray-600 mb-2 drop-shadow-md" />
                  <span className="text-3xl font-black opacity-40">2</span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <div className="flex flex-col items-center w-32 sm:w-48 z-10 animate-fade-in-up">
                <div className="text-center mb-4">
                  <h3 className="text-base sm:text-xl font-black text-white truncate w-full shadow-black drop-shadow-lg">{top3[0].presenter_name}</h3>
                  <p className="text-sm sm:text-base font-black text-yellow-400 drop-shadow-md">{top3[0].overall_score > 0 ? top3[0].overall_score.toFixed(2) : '-'}</p>
                </div>
                <div className={`w-full rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-6 border-t-2 border-l border-r ${getPodiumStyle(0)}`}>
                  <Trophy size={56} className="text-yellow-700 mb-2 drop-shadow-md" />
                  <span className="text-5xl font-black opacity-30">1</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <div className="flex flex-col items-center w-28 sm:w-40 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="text-center mb-4">
                  <h3 className="text-sm sm:text-lg font-black text-white truncate w-full">{top3[2].presenter_name}</h3>
                  <p className="text-xs sm:text-sm font-bold text-orange-300">{top3[2].overall_score > 0 ? top3[2].overall_score.toFixed(2) : '-'}</p>
                </div>
                <div className={`w-full rounded-t-2xl shadow-2xl flex flex-col items-center justify-start pt-6 border-t border-l border-r ${getPodiumStyle(2)}`}>
                  <Medal size={32} className="text-orange-900 mb-2 drop-shadow-md" />
                  <span className="text-3xl font-black opacity-40">3</span>
                </div>
              </div>
            )}
          </div>

          {/* COMPLETE RANKINGS LIST */}
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center gap-2 text-white font-bold uppercase tracking-widest text-sm mb-6 px-2 border-b border-white/20 pb-4">
              <ListOrdered size={18} />
              <h4>Complete Ranking</h4>
            </div>
            
            {sortedLeaderboard.map((student: any, index: number) => (
              <div 
                key={student.presenter_id} 
                className={`rounded-2xl p-5 sm:p-6 shadow-lg border flex flex-col gap-4 transform transition-all hover:scale-[1.01] ${getListRankStyle(index)}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/50 dark:bg-black/20 shadow-sm border border-black/5 dark:border-white/5">
                      {getRankIcon(index)}
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                        {student.presenter_name}
                      </h3>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <Users size={14} /> {student.count} peer evaluation{student.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                      {student.overall_score > 0 ? student.overall_score.toFixed(2) : '-'}
                    </div>
                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Overall Score
                    </div>
                  </div>
                </div>

                {student.averages && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-4 border-t border-black/5 dark:border-white/10 mt-2">
                    <div className="bg-white/40 dark:bg-black/20 rounded-xl p-2 text-center border border-white/50 dark:border-white/5">
                      <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Knowledge</div>
                      <div className="text-sm sm:text-base font-black text-slate-800 dark:text-white">{student.averages.avg_content ? student.averages.avg_content.toFixed(1) : '-'}</div>
                    </div>
                    <div className="bg-white/40 dark:bg-black/20 rounded-xl p-2 text-center border border-white/50 dark:border-white/5">
                      <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Structure</div>
                      <div className="text-sm sm:text-base font-black text-slate-800 dark:text-white">{student.averages.avg_org ? student.averages.avg_org.toFixed(1) : '-'}</div>
                    </div>
                    <div className="bg-white/40 dark:bg-black/20 rounded-xl p-2 text-center border border-white/50 dark:border-white/5">
                      <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Delivery</div>
                      <div className="text-sm sm:text-base font-black text-slate-800 dark:text-white">{student.averages.avg_delivery ? student.averages.avg_delivery.toFixed(1) : '-'}</div>
                    </div>
                    <div className="bg-white/40 dark:bg-black/20 rounded-xl p-2 text-center border border-white/50 dark:border-white/5">
                      <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Confidence</div>
                      <div className="text-sm sm:text-base font-black text-slate-800 dark:text-white">{student.averages.avg_confidence ? student.averages.avg_confidence.toFixed(1) : '-'}</div>
                    </div>
                    <div className="bg-white/40 dark:bg-black/20 rounded-xl p-2 text-center border border-white/50 dark:border-white/5">
                      <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Engage</div>
                      <div className="text-sm sm:text-base font-black text-slate-800 dark:text-white">{student.averages.avg_engagement ? student.averages.avg_engagement.toFixed(1) : '-'}</div>
                    </div>
                    <div className="bg-white/40 dark:bg-black/20 rounded-xl p-2 text-center border border-white/50 dark:border-white/5">
                      <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Timing</div>
                      <div className="text-sm sm:text-base font-black text-slate-800 dark:text-white">{student.averages.avg_time ? student.averages.avg_time.toFixed(1) : '-'}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
