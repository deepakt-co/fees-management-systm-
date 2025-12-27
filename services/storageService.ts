import { Student, Payment, FeeStatus, DashboardStats } from '../types';

const STORAGE_KEY = 'scholarflow_data_v2'; // Version bump for new fields

const getInitialData = (): Student[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getStudents = (): Student[] => {
  return getInitialData();
};

export const saveStudent = (student: Student): void => {
  const students = getInitialData();
  const index = students.findIndex((s) => s.id === student.id);
  if (index >= 0) {
    students[index] = student;
  } else {
    students.push(student);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
};

export const deleteStudent = (id: string): void => {
  const students = getInitialData().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
};

export const addPayment = (studentId: string, amount: number, nextDueDate: string): Student | null => {
  const students = getInitialData();
  const index = students.findIndex((s) => s.id === studentId);
  
  if (index === -1) return null;

  const payment: Payment = {
    id: crypto.randomUUID(),
    amount,
    date: new Date().toISOString(),
  };

  const updatedStudent = {
    ...students[index],
    nextDueDate: nextDueDate,
    payments: [...students[index].payments, payment]
  };

  students[index] = updatedStudent;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  return updatedStudent;
};

export const calculateStatus = (nextDueDate: string): FeeStatus => {
  const today = new Date();
  const due = new Date(nextDueDate);
  
  // Reset time part for accurate day comparison
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  if (today > due) return FeeStatus.OVERDUE;
  return FeeStatus.PENDING; 
};

export const getDashboardStats = (): DashboardStats => {
  const students = getStudents();
  const totalStudents = students.length;
  const totalCollected = students.reduce((acc, s) => {
    return acc + s.payments.reduce((pAcc, p) => pAcc + p.amount, 0);
  }, 0);
  
  let pendingAmount = 0;
  let overdueCount = 0;

  students.forEach(s => {
    const status = calculateStatus(s.nextDueDate);
    if (status === FeeStatus.OVERDUE) {
      overdueCount++;
      pendingAmount += s.monthlyFee;
    }
  });

  return {
    totalStudents,
    totalCollected,
    pendingAmount,
    overdueCount
  };
};

// --- New Functionality: Backup, Restore, Export ---

export const exportToCSV = (): void => {
  const students = getStudents();
  if (students.length === 0) return;

  const headers = ['ID,Name,Father Name,Course,Fee Type,Cycle Amount,Contact,Address,Enrollment Date,Total Paid,Status'];
  const rows = students.map(s => {
    const totalPaid = s.payments.reduce((sum, p) => sum + p.amount, 0);
    const status = calculateStatus(s.nextDueDate);
    // Escape commas in strings
    const safe = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
    
    return [
      s.id,
      safe(s.name),
      safe(s.fatherName || ''),
      safe(s.course),
      s.feeFrequency,
      s.monthlyFee,
      safe(s.contactNumber),
      safe(s.address),
      s.enrollmentDate.split('T')[0],
      totalPaid,
      status
    ].join(',');
  });

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `ScholarFlow_Export_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

export const downloadBackup = (): void => {
  const students = getStudents();
  const blob = new Blob([JSON.stringify(students, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `ScholarFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
};

export const restoreBackup = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          // Simple validation: check if items have IDs and names
          const isValid = data.every(item => item.id && item.name);
          if (isValid) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            resolve(true);
          } else {
            alert("Invalid backup file structure.");
            resolve(false);
          }
        } else {
          alert("Invalid file format.");
          resolve(false);
        }
      } catch (err) {
        console.error(err);
        alert("Error parsing backup file.");
        resolve(false);
      }
    };
    reader.onerror = () => reject(false);
    reader.readAsText(file);
  });
};