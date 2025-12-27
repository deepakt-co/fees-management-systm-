import React, { useState } from 'react';
import { Camera, Upload, X, User, BookOpen, CreditCard, Calendar } from 'lucide-react';
import { Student, FeeFrequency } from '../types';

interface StudentFormProps {
  initialData?: Student;
  onSubmit: (student: Student) => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Student>>(
    initialData || {
      name: '',
      fatherName: '',
      address: '',
      contactNumber: '',
      course: '',
      monthlyFee: 0,
      feeFrequency: 'Monthly',
      totalInstallments: 0,
      nextDueDate: new Date().toISOString().split('T')[0],
    }
  );
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(initialData?.photo);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size too large. Please select an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setFormData(prev => ({ ...prev, photo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.monthlyFee || !formData.course) return;

    const student: Student = {
      id: initialData?.id || crypto.randomUUID(),
      name: formData.name!,
      fatherName: formData.fatherName || '',
      address: formData.address || '',
      contactNumber: formData.contactNumber || '',
      course: formData.course!,
      monthlyFee: Number(formData.monthlyFee),
      feeFrequency: (formData.feeFrequency as FeeFrequency) || 'Monthly',
      totalInstallments: Number(formData.totalInstallments) || 0,
      photo: photoPreview,
      enrollmentDate: initialData?.enrollmentDate || new Date().toISOString(),
      nextDueDate: formData.nextDueDate!,
      payments: initialData?.payments || [],
    };

    onSubmit(student);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-indigo-700">
          <h2 className="text-xl font-bold text-white flex items-center">
            {initialData ? 'Edit Student Record' : 'New Student Admission'}
          </h2>
          <button onClick={onCancel} className="text-white/80 hover:text-white transition-colors bg-white/10 rounded-full p-1 hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          <form id="student-form" onSubmit={handleSubmit} className="space-y-8">
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Photo Section */}
              <div className="flex flex-col items-center space-y-4 w-full md:w-auto">
                <div className="relative w-32 h-32 rounded-full bg-slate-50 border-4 border-indigo-50 shadow-inner flex items-center justify-center overflow-hidden group">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <User className="w-12 h-12 text-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all text-sm font-semibold shadow-sm border border-slate-200">
                  <Upload className="w-4 h-4 mr-2" />
                  Select Photo
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>

              {/* Basic Info Fields */}
              <div className="flex-1 w-full space-y-5">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                      <input type="text" name="name" required value={formData.name} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                        placeholder="Student Name" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Father's Name</label>
                      <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Guardian Name" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Number</label>
                      <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Course / Class</label>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input type="text" name="course" required value={formData.course} onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="e.g. Web Development" />
                      </div>
                    </div>
                 </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Fee Configuration */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
                Fee Structure
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fee Type</label>
                  <select name="feeFrequency" value={formData.feeFrequency} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    <option value="Monthly">Monthly</option>
                    <option value="Annually">Annually</option>
                    <option value="Installment">Installments</option>
                    <option value="OneTime">One Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {formData.feeFrequency === 'Installment' ? 'Amount per Installment' : 'Amount (₹)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-semibold">₹</span>
                    <input type="number" name="monthlyFee" required min="0" value={formData.monthlyFee} onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
                  </div>
                </div>

                {formData.feeFrequency === 'Installment' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Installments</label>
                    <input type="number" name="totalInstallments" min="1" max="60" value={formData.totalInstallments} onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                      placeholder="e.g. 3"/>
                  </div>
                )}
              </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                    Next Due Date
                  </label>
                  <input type="date" name="nextDueDate" required value={formData.nextDueDate} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Residential Address</label>
                  <textarea name="address" rows={1} value={formData.address} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="City, Area, Pincode" />
                </div>
             </div>

          </form>
        </div>

        <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex justify-end space-x-4">
          <button type="button" onClick={onCancel}
            className="px-6 py-2.5 text-slate-700 font-semibold hover:bg-slate-200 rounded-xl transition-colors border border-slate-300 shadow-sm">
            Cancel
          </button>
          <button type="submit" form="student-form"
            className="px-8 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5">
            Save Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;