"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { PlusCircle, Play, CheckCircle, ListChecks, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const [sessions, setSessions] = useState<any[]>([]); // These are PresentationSessions
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // New Weekly Session form state
  const [theme, setTheme] = useState("");
  const [selectedPresenters, setSelectedPresenters] = useState<number[]>([]);
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    if (role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [sessRes, stuRes] = await Promise.all([
        fetchAPI("/sessions/"),
        fetchAPI("/users/")
      ]);

      if (sessRes.ok && stuRes.ok) {
        setSessions(await sessRes.json());
        const allUsers = await stuRes.json();
        setStudents(allUsers.filter((u: any) => u.role !== "ADMIN"));
      } else {
        if (sessRes.status === 401) router.push("/");
      }
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  const togglePresenter = (id: number) => {
    setSelectedPresenters(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedPresenters(students.map(s => s.id));
  const deselectAll = () => setSelectedPresenters([]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setFormError("");

    if (selectedPresenters.length === 0) {
      setFormError("Please select at least one presenter for this week.");
      setCreating(false);
      return;
    }

    try {
      const res = await fetchAPI("/weekly_sessions/", {
        method: "POST",
        body: JSON.stringify({
          theme: theme,
          presenter_ids: selectedPresenters
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to create weekly session.");
      }

      // Reset form
      setTheme("");
      setSelectedPresenters([]);
      
      // Reload sessions
      loadData();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const updateSessionStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetchAPI(`/sessions/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        const data = await res.json();
        alert("Error: " + (data.non_field_errors?.[0] || "Could not update status. Check if another session is already active."));
      }
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteWeeklySession = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this Weekly Session? All history, presentations, and evaluations tied to it will be destroyed.")) return;
    try {
      const res = await fetchAPI(`/weekly_sessions/${id}/`, { method: "DELETE" });
      if (res.ok) {
        loadData();
      } else {
        alert("Failed to delete session.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-white font-medium">Loading admin panel...</div>;
  }

  // Group individual presentations by their WeeklySession ID
  const groupedSessions = sessions.reduce((acc, curr) => {
    if (!curr.weekly_session_details) return acc;
    const wid = curr.weekly_session_details.id;
    if (!acc[wid]) {
      acc[wid] = {
        theme: curr.weekly_session_details.theme,
        id: wid,
        presentations: []
      };
    }
    acc[wid].presentations.push(curr);
    return acc;
  }, {} as Record<number, any>);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Admin Portal</h2>
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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-brand-light/30 sticky top-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <PlusCircle className="text-brand-blue" />
              New Weekly Session
            </h3>
            
            {formError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSession} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Weekly Theme / Topic</label>
                <input
                  type="text"
                  required
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-brand-blue text-slate-900 dark:text-white placeholder-slate-400"
                  placeholder="e.g. Public Speaking Fundamentals"
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Presenters</label>
                  <div className="flex gap-2 text-[10px] font-bold">
                    <button type="button" onClick={selectAll} className="text-brand-blue hover:underline">Select All</button>
                    <span className="text-gray-300">|</span>
                    <button type="button" onClick={deselectAll} className="text-slate-500 hover:underline">Clear</button>
                  </div>
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {students.map(s => (
                    <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedPresenters.includes(s.id) ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 hover:bg-gray-100'}`}>
                      <input 
                        type="checkbox"
                        checked={selectedPresenters.includes(s.id)}
                        onChange={() => togglePresenter(s.id)}
                        className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{s.first_name} {s.last_name}</p>
                        <p className="text-[10px] text-slate-500">{s.username}</p>
                      </div>
                    </label>
                  ))}
                  {students.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">No students registered yet.</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-brand-blue hover:bg-brand-hover text-white font-bold py-3.5 rounded-xl transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {creating ? "Creating..." : <><ListChecks size={18} /> Create Weekly Event</>}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Sessions List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-bold text-white mb-2">Weekly Events</h3>
          
          {Object.keys(groupedSessions).length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center text-white/80 border border-white/20">
              No weekly sessions have been created yet.
            </div>
          ) : (
            <div className="space-y-8">
              {Object.values(groupedSessions).map((weekly: any) => (
                <div key={weekly.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                  {/* Weekly Session Header */}
                  <div className="bg-slate-50 dark:bg-slate-900 p-5 sm:px-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weekly Theme</span>
                      <h4 className="text-xl font-bold text-slate-800 dark:text-white">{weekly.theme}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteWeeklySession(weekly.id)}
                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-2.5 rounded-xl transition-all flex items-center shadow-sm hover:shadow-md"
                        title="Delete Weekly Session"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => router.push(`/results/${weekly.id}`)}
                        className="bg-brand-blue hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                      >
                        View Leaderboard
                      </button>
                    </div>
                  </div>
                  
                  {/* Presenters List */}
                  <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {weekly.presentations.map((session: any) => (
                      <div key={session.id} className={`p-5 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${session.status === 'ACTIVE' ? 'bg-green-50/50 dark:bg-green-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                              {session.presenter_details.first_name} {session.presenter_details.last_name}
                            </p>
                            {session.status === 'ACTIVE' && (
                              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase animate-pulse border border-green-200">
                                On Stage
                              </span>
                            )}
                            {session.status === 'COMPLETED' && (
                              <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-gray-200">
                                Finished
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-medium">ID: {session.presenter_details.username}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {session.status === 'SCHEDULED' && (
                            <button
                              onClick={() => updateSessionStatus(session.id, 'ACTIVE')}
                              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                            >
                              <Play size={14} /> Start Turn
                            </button>
                          )}
                          {session.status === 'ACTIVE' && (
                            <button
                              onClick={() => updateSessionStatus(session.id, 'COMPLETED')}
                              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                            >
                              <CheckCircle size={14} /> End Turn
                            </button>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
