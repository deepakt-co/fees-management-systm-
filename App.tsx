import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import FeesManager from './components/FeesManager';
import { Student } from './types';
import { getStudents, saveStudent, deleteStudent, getDashboardStats } from './services/storageService';
import { Plus } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'fees'>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState(getDashboardStats());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);

  const refreshData = () => {
    const data = getStudents();
    setStudents(data);
    setStats(getDashboardStats());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSaveStudent = (student: Student) => {
    saveStudent(student);
    refreshData();
    setIsFormOpen(false);
    setEditingStudent(undefined);
  };

  const handleDeleteStudent = (id: string) => {
    deleteStudent(id);
    refreshData();
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingStudent(undefined);
    setIsFormOpen(true);
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      
      {/* Dynamic Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 capitalize tracking-tight">{activeTab}</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {activeTab === 'dashboard' && `Overview for ${new Date().toLocaleDateString('en-IN')}`}
            {activeTab === 'students' && `Manage ${students.length} students records`}
            {activeTab === 'fees' && 'Track and record payments'}
          </p>
        </div>
        
        {activeTab === 'students' && (
          <button
            onClick={handleAddNewClick}
            className="flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Student
          </button>
        )}
      </div>

      {/* Content Area */}
      {activeTab === 'dashboard' && (
        <Dashboard stats={stats} students={students} onDataUpdate={refreshData} />
      )}

      {activeTab === 'students' && (
        <StudentList 
          students={students} 
          onEdit={handleEditClick} 
          onDelete={handleDeleteStudent} 
        />
      )}

      {activeTab === 'fees' && (
        <FeesManager students={students} onPaymentSuccess={refreshData} />
      )}

      {/* Modal Form */}
      {isFormOpen && (
        <StudentForm
          initialData={editingStudent}
          onSubmit={handleSaveStudent}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingStudent(undefined);
          }}
        />
      )}
    </Layout>
  );
}

export default App;