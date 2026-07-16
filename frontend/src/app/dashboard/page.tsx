"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";

export default function Dashboard() {
  const [sessions, setSessions] = useState<any[]>([]); // individual presentations
  const [weeklySessions, setWeeklySessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");

  useEffect(() => {
    setIsAdmin(localStorage.getItem("user_role") === "ADMIN");
    setCurrentUsername(localStorage.getItem("username") || "");
    
    const loadData = async () => {
      try {
        const [sessRes, weekRes] = await Promise.all([
          fetchAPI("/sessions/"),
          fetchAPI("/weekly_sessions/")
        ]);

        if (sessRes.ok && weekRes.ok) {
          setSessions(await sessRes.json());
          setWeeklySessions(await weekRes.json());
        } else {
          if (sessRes.status === 401) {
            router.push("/");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    
    const intervalId = setInterval(loadData, 3000);
    return () => clearInterval(intervalId);
  }, [router]);

  if (loading) {
    return <div className="p-8 text-center text-white font-bold">Loading dashboard...</div>;
  }

  // Filter Active Presentations so you CANNOT evaluate your own!
  const activeSessions = sessions.filter((s) => s.status === "ACTIVE" && s.presenter_details.username !== currentUsername);
  const upcomingSessions = sessions.filter((s) => s.status === "SCHEDULED");

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          {isAdmin && (
            <button 
              onClick={() => router.push('/admin')}
              className="bg-brand-light hover:bg-white text-white hover:text-brand-blue font-bold px-4 py-2 rounded-lg transition-colors shadow-md"
            >
              Admin Panel
            </button>
          )}
          <button 
            onClick={() => {
              localStorage.clear();
              router.push("/");
            }}
            className="text-white hover:text-red-300 font-medium bg-white/10 px-4 py-2 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
      
      <section>
        <h3 className="text-2xl font-semibold mb-4 text-white">Live Now</h3>
        {activeSessions.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center text-white/80 border border-white/20">
            No active presentations for you to evaluate right now.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="bg-gradient-to-br from-brand-blue to-indigo-700 rounded-2xl p-6 shadow-xl text-white transform transition-all hover:scale-105 border border-brand-light/20 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 3.83L18.17 19H5.83L12 5.83z"/></svg>
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <h4 className="text-xl font-bold leading-tight">{session.weekly_session_details?.theme}</h4>
                    <span className="bg-red-500 animate-pulse text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shrink-0 shadow-lg">
                      Live
                    </span>
                  </div>
                  <p className="text-white font-black text-lg mb-6 drop-shadow-md">
                    By: {session.presenter_details.first_name} {session.presenter_details.last_name}
                  </p>
                  {session.has_evaluated ? (
                    <button
                      disabled
                      className="w-full bg-green-500/20 text-green-300 font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 cursor-not-allowed border border-green-500/30"
                    >
                      Evaluated ✅
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(`/evaluate/${session.id}`)}
                      className="w-full bg-white text-brand-blue hover:bg-gray-100 font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-lg"
                    >
                      Evaluate Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h3 className="text-2xl font-semibold mb-4 text-white">Upcoming Turns</h3>
          {upcomingSessions.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center text-white/80 border border-white/20">
              No upcoming presentations scheduled.
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 max-h-96 overflow-y-auto custom-scrollbar">
              <div className="divide-y divide-gray-100">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div>
                      <h4 className="text-base font-bold text-slate-800">{session.weekly_session_details?.theme}</h4>
                      <p className="text-slate-500 text-sm font-medium">
                        {session.presenter_details.first_name} {session.presenter_details.last_name}
                      </p>
                    </div>
                    <span className="bg-blue-50 text-brand-blue px-3 py-1 rounded-lg text-xs font-bold border border-blue-100 shrink-0">
                      Scheduled
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-4 text-white">Weekly Leaderboards</h3>
          {weeklySessions.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center text-white/80 border border-white/20">
              No weekly sessions have been created yet.
            </div>
          ) : (
            <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-700 max-h-96 overflow-y-auto custom-scrollbar">
              <div className="divide-y divide-slate-800">
                {weeklySessions.map((weekly) => (
                  <div key={weekly.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-800 transition-colors group">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Theme</span>
                      <h4 className="text-base font-bold text-white">{weekly.theme}</h4>
                    </div>
                    <button
                      onClick={() => router.push(`/results/${weekly.id}`)}
                      className="bg-brand-blue hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md group-hover:shadow-lg flex items-center gap-2 shrink-0"
                    >
                      <Trophy size={14} /> View Rank
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
