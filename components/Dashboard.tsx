import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Sparkles, TrendingUp, Users, DollarSign, AlertCircle, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { Student, DashboardStats, FeeStatus } from '../types';
import { generateFinancialInsight } from '../services/geminiService';
import { calculateStatus, downloadBackup, restoreBackup, exportToCSV } from '../services/storageService';

interface DashboardProps {
  stats: DashboardStats;
  students: Student[];
  onDataUpdate: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, students, onDataUpdate }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const COLORS = ['#6366f1', '#ef4444', '#10b981']; // Indigo, Red, Emerald

  // Prepare Chart Data
  const statusData = [
    { name: 'Active', value: students.filter(s => calculateStatus(s.nextDueDate) !== FeeStatus.OVERDUE).length },
    { name: 'Overdue', value: stats.overdueCount },
  ];

  // Dummy monthly data logic retained for demo visualization
  const monthlyData = [
    { name: 'Jan', amount: 0 }, { name: 'Feb', amount: 0 }, { name: 'Mar', amount: 0 },
    { name: 'Apr', amount: 0 }, { name: 'May', amount: 0 }, { name: 'Jun', amount: 0 },
  ];
  
  students.forEach(s => {
    s.payments.forEach(p => {
      const month = new Date(p.date).getMonth();
      if (month < 6) monthlyData[month].amount += p.amount;
    });
  });

  const handleGenerateInsight = async () => {
    setIsLoadingInsight(true);
    const result = await generateFinancialInsight(students);
    setInsight(result);
    setIsLoadingInsight(false);
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if(window.confirm("Restoring will overwrite current data. Continue?")) {
        const success = await restoreBackup(e.target.files[0]);
        if (success) {
          alert("Data restored successfully!");
          onDataUpdate();
        }
      }
      e.target.value = ''; // Reset input
    }
  };

  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 flex items-start justify-between hover:translate-y-[-2px] transition-transform duration-300">
      <div>
        <p className="text-sm font-semibold text-slate-500 mb-1 tracking-wide uppercase text-[11px]">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
        <p className={`text-xs mt-2 font-medium ${color}`}>{sub}</p>
      </div>
      <div className={`p-4 rounded-xl ${color.replace('text-', 'bg-').replace('600', '50').replace('700', '50')} ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1">Real-time financial analytics and student insights.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
           <button 
             onClick={exportToCSV}
             className="flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 font-medium transition-all shadow-sm"
           >
             <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
             Export Excel
           </button>
           
           <button 
             onClick={downloadBackup}
             className="flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 font-medium transition-all shadow-sm"
           >
             <Download className="w-4 h-4 mr-2 text-blue-600" />
             Backup Data
           </button>

           <button 
             onClick={() => fileInputRef.current?.click()}
             className="flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 font-medium transition-all shadow-sm"
           >
             <Upload className="w-4 h-4 mr-2 text-orange-600" />
             Restore
           </button>
           <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleRestore} />

           <button
            onClick={handleGenerateInsight}
            disabled={isLoadingInsight}
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-70 font-medium"
           >
            <Sparkles className="w-4 h-4 mr-2" />
            {isLoadingInsight ? 'Analyzing...' : 'AI Insights'}
           </button>
        </div>
      </div>

      {insight && (
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-white border border-indigo-100 p-6 rounded-2xl animate-in slide-in-from-top-4 shadow-sm">
          <div className="flex items-start">
             <div className="p-2.5 bg-white rounded-xl shadow-sm mr-4 border border-indigo-50">
                <Sparkles className="w-6 h-6 text-indigo-600" />
             </div>
             <div>
                <h4 className="text-lg font-bold text-indigo-900 mb-2">Smart Analysis</h4>
                <div className="text-sm text-indigo-800 space-y-2 leading-relaxed opacity-90" dangerouslySetInnerHTML={{ __html: insight }} />
             </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats.totalStudents} sub="Currently Enrolled" icon={Users} color="text-indigo-600" />
        <StatCard title="Total Collected" value={`₹${stats.totalCollected.toLocaleString('en-IN')}`} sub="Lifetime Revenue" icon={DollarSign} color="text-emerald-600" />
        <StatCard title="Pending Dues" value={`₹${stats.pendingAmount.toLocaleString('en-IN')}`} sub="Estimated Pending" icon={AlertCircle} color="text-orange-600" />
        <StatCard title="Overdue Accounts" value={stats.overdueCount} sub="Immediate Action Required" icon={TrendingUp} color="text-red-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Trend (Last 6 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} 
                  formatter={(value) => [`₹${value}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col">
           <h3 className="text-lg font-bold text-slate-800 mb-2">Payment Status Distribution</h3>
           <p className="text-sm text-slate-500 mb-6">Active vs Overdue Accounts</p>
           <div className="h-64 flex-1 flex items-center justify-center relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
             </ResponsiveContainer>
             {/* Center Text */}
             <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-3xl font-bold text-slate-800">{students.length}</span>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total</span>
             </div>
           </div>
           <div className="flex justify-center space-x-6 mt-4">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 shadow-sm" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-sm font-medium text-slate-600">{entry.name}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;