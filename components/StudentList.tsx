import React, { useState } from 'react';
import { Search, Edit, Trash2, Filter } from 'lucide-react';
import { Student, FeeStatus } from '../types';
import { calculateStatus } from '../services/storageService';

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'overdue'>('all');

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.contactNumber.includes(searchTerm);
    
    if (filter === 'overdue') {
      return matchesSearch && calculateStatus(student.nextDueDate) === FeeStatus.OVERDUE;
    }
    return matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Student Directory</h3>
        
        <div className="flex items-center space-x-4">
           {/* Quick Filter */}
           <div className="flex bg-slate-100 rounded-lg p-1">
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('overdue')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'overdue' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Overdue
              </button>
           </div>

           <div className="relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Search by name, course..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-64 shadow-sm"
             />
           </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Student Name / Father</th>
              <th className="px-6 py-4">Course & Contact</th>
              <th className="px-6 py-4">Fee Structure</th>
              <th className="px-6 py-4">Status & Due</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredStudents.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                   <div className="flex flex-col items-center justify-center">
                     <Filter className="w-12 h-12 mb-3 text-slate-200" />
                     <p className="font-medium">No students found matching your criteria.</p>
                   </div>
                 </td>
               </tr>
            ) : (
              filteredStudents.map((student) => {
                const status = calculateStatus(student.nextDueDate);
                const isOverdue = status === FeeStatus.OVERDUE;
                
                return (
                  <tr key={student.id} className={`transition-all duration-200 border-l-4 ${
                    isOverdue 
                      ? 'bg-red-50/30 hover:bg-red-50/60 border-red-500' 
                      : 'hover:bg-slate-50 border-transparent'
                  }`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 ${isOverdue ? 'border-red-200' : 'border-indigo-100'}`}>
                          {student.photo ? (
                            <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center font-bold text-lg ${isOverdue ? 'bg-red-100 text-red-500' : 'bg-indigo-50 text-indigo-500'}`}>
                              {student.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className={`font-bold text-base ${isOverdue ? 'text-red-700' : 'text-slate-800'}`}>{student.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{student.fatherName ? `S/o ${student.fatherName}` : 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">{student.course}</span>
                        <span className="text-slate-500 text-xs mt-1">{student.contactNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 w-fit mb-1">
                          {student.feeFrequency}
                        </span>
                        <span className="text-slate-700 font-semibold">₹{student.monthlyFee.toLocaleString('en-IN')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                         <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border w-fit ${
                            isOverdue
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}>
                            {isOverdue ? 'Overdue' : 'Active'}
                          </span>
                          <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                            Due: {new Date(student.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <button 
                          onClick={() => onEdit(student)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors group"
                          title="Edit Details"
                        >
                          <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) onDelete(student.id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentList;