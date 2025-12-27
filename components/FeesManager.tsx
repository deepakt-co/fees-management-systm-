import React, { useState } from 'react';
import { Student, FeeStatus } from '../types';
import { calculateStatus, addPayment } from '../services/storageService';
import { CheckCircle2, AlertCircle, CreditCard, Calendar } from 'lucide-react';

interface FeesManagerProps {
  students: Student[];
  onPaymentSuccess: () => void;
}

const FeesManager: React.FC<FeesManagerProps> = ({ students, onPaymentSuccess }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [nextDueDate, setNextDueDate] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  React.useEffect(() => {
    if (selectedStudent) {
      setAmount(selectedStudent.monthlyFee);
      // Logic for next due date
      const date = new Date();
      if (selectedStudent.feeFrequency === 'Annually') {
          date.setFullYear(date.getFullYear() + 1);
      } else {
          date.setMonth(date.getMonth() + 1);
      }
      setNextDueDate(date.toISOString().split('T')[0]);
    }
  }, [selectedStudent]);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !amount || !nextDueDate) return;

    const result = addPayment(selectedStudentId, amount, new Date(nextDueDate).toISOString());
    if (result) {
      setFeedback({ type: 'success', msg: `Payment of ₹${amount} recorded for ${result.name}!` });
      onPaymentSuccess();
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', msg: 'Failed to record payment.' });
    }
  };

  const overdueStudents = students.filter(s => calculateStatus(s.nextDueDate) === FeeStatus.OVERDUE);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Payment Entry Form */}
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-8">
        <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center">
          <div className="p-2 bg-indigo-50 rounded-lg mr-3">
             <CreditCard className="w-5 h-5 text-indigo-600" />
          </div>
          Record New Payment
        </h3>

        <form onSubmit={handlePayment} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50/50"
              required
            >
              <option value="">-- Choose Student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} • {s.course} ({calculateStatus(s.nextDueDate) === FeeStatus.OVERDUE ? 'Overdue' : 'Active'})
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="space-y-6 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl text-sm">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500">Current Plan</span>
                    <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{selectedStudent.feeFrequency}</span>
                 </div>
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500">Status</span>
                    <span className={calculateStatus(selectedStudent.nextDueDate) === FeeStatus.OVERDUE ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>
                        {calculateStatus(selectedStudent.nextDueDate)}
                    </span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-500">Last Payment</span>
                    <span className="font-medium text-slate-700">
                        {selectedStudent.payments.length > 0 ? new Date(selectedStudent.payments[selectedStudent.payments.length - 1].date).toLocaleDateString() : 'Never'}
                    </span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Next Due Date</label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
              >
                Confirm Payment
              </button>
            </div>
          )}
        </form>

        {feedback && (
          <div className={`mt-6 p-4 rounded-xl flex items-center border ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
            <span className="font-medium">{feedback.msg}</span>
          </div>
        )}
      </div>

      {/* Pending List */}
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-full">
        <div className="p-6 border-b border-red-100 bg-red-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-red-800 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Pending Dues
          </h3>
          <span className="bg-white text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100 shadow-sm">
            {overdueStudents.length} Students
          </span>
        </div>
        <div className="overflow-y-auto flex-1 p-0 custom-scrollbar">
          {overdueStudents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                 <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="font-medium text-slate-600">All clear!</p>
              <p className="text-sm mt-1">No overdue payments found.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {overdueStudents.map(student => (
                <li key={student.id} className="p-5 hover:bg-red-50/30 flex items-center justify-between transition-colors group">
                  <div className="flex items-center space-x-4">
                     <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm border-2 border-white shadow-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-red-700 transition-colors">{student.name}</p>
                        <div className="flex items-center text-xs text-red-500 font-medium mt-0.5">
                            <Calendar className="w-3 h-3 mr-1" />
                            Due: {new Date(student.nextDueDate).toLocaleDateString()}
                        </div>
                      </div>
                  </div>
                  <button 
                    onClick={() => { setSelectedStudentId(student.id); }}
                    className="px-4 py-2 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 shadow-sm shadow-red-200 transition-all"
                  >
                    Collect
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeesManager;