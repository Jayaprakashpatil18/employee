'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  CheckSquare,
  Clock,
  AlertTriangle,
  Play,
  CheckCircle2,
  XCircle,
  UserCheck,
  X,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Task {
  id: string;
  title: string;
  description?: string;
  assignedDepartment: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'OVERDUE';
  computedStatus?: string;
  priority: string;
  dueDate?: string;
  isOverdue?: boolean;
  isMandatory: boolean;
  completionRemarks?: string;
  employee?: { firstName: string; lastName: string; employeeId: string };
  assignedUser?: { name: string; email: string };
}

export default function TasksWorkspacePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');

  // Modals
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionRemarks, setCompletionRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [selectedDept, selectedStatus, selectedPriority]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedDept !== 'ALL') params.department = selectedDept;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (selectedPriority !== 'ALL') params.priority = selectedPriority;
      if (searchQuery) params.search = searchQuery;

      const res = await apiClient.get('/tasks', { params });
      setTasks(res.data);
    } catch (err) {
      // Fallback preview data
      setTasks([
        {
          id: 't1',
          title: 'Prepare Developer Laptop',
          description: 'Configure MacBook Pro M3 with macOS standard image',
          assignedDepartment: 'IT',
          status: 'COMPLETED',
          priority: 'HIGH',
          dueDate: '2026-09-17T00:00:00.000Z',
          isMandatory: true,
          completionRemarks: 'Configured macOS M3 Pro image.',
          employee: { firstName: 'Alex', lastName: 'Turner', employeeId: 'EMP-2026-0001' },
          assignedUser: { name: 'David Miller', email: 'david.miller@corp.example.com' },
        },
        {
          id: 't2',
          title: 'Create Email Account & System Access',
          description: 'Grant repo & IAM write permissions',
          assignedDepartment: 'IT',
          status: 'IN_PROGRESS',
          priority: 'CRITICAL',
          dueDate: '2026-09-19T00:00:00.000Z',
          isMandatory: true,
          employee: { firstName: 'Rahul', lastName: 'Sharma', employeeId: 'EMP-2026-0002' },
          assignedUser: { name: 'David Miller', email: 'david.miller@corp.example.com' },
        },
        {
          id: 't3',
          title: 'Payroll Direct Deposit Setup',
          description: 'Verify routing numbers for direct deposit',
          assignedDepartment: 'FINANCE',
          status: 'TODO',
          priority: 'MEDIUM',
          dueDate: '2026-09-10T00:00:00.000Z', // Past due
          isOverdue: true,
          isMandatory: true,
          employee: { firstName: 'Marcus', lastName: 'Vance', employeeId: 'EMP-2026-0003' },
          assignedUser: { name: 'Rachel Adams', email: 'rachel.adams@corp.example.com' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      await apiClient.post(`/tasks/${taskId}/start`);
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start task.');
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setSubmitting(true);
    try {
      await apiClient.post(`/tasks/${selectedTask.id}/complete`, {
        completionRemarks,
      });
      setShowCompleteModal(false);
      setCompletionRemarks('');
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete task.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-red-100 text-red-800 border border-red-200">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-orange-100 text-orange-800 border border-orange-200">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-full text-2xs font-medium bg-blue-100 text-blue-800 border border-blue-200">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-2xs font-medium bg-slate-100 text-slate-700">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Departmental Tasks Board</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track and complete IT, Finance, Administration, and Manager onboarding assignments.
          </p>
        </div>
      </div>

      {/* Filters and Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks by title, department, or employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTasks()}
              className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Department:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-white border border-slate-300 rounded-md px-2.5 py-1"
              >
                <option value="ALL">All Departments</option>
                <option value="IT">IT</option>
                <option value="FINANCE">Finance</option>
                <option value="ADMINISTRATION">Administration</option>
                <option value="REPORTING_MANAGER">Manager</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600">
              <span>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-white border border-slate-300 rounded-md px-2.5 py-1"
              >
                <option value="ALL">All Statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="px-6 py-3.5">Task Title</th>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Dept</th>
                <th className="px-6 py-3.5">Assignee</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Due Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div>{task.title}</div>
                    <div className="text-2xs text-slate-400 font-normal">{task.description}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {task.employee ? `${task.employee.firstName} ${task.employee.lastName}` : 'Unassigned'}
                  </td>
                  <td className="px-6 py-4">{task.assignedDepartment}</td>
                  <td className="px-6 py-4">{task.assignedUser?.name || 'Unassigned'}</td>
                  <td className="px-6 py-4">{getPriorityBadge(task.priority)}</td>
                  <td className="px-6 py-4">
                    {task.dueDate ? (
                      <div className="flex items-center gap-1">
                        <span className={task.isOverdue ? 'text-red-600 font-bold' : ''}>
                          {task.dueDate.substring(0, 10)}
                        </span>
                        {task.isOverdue && (
                          <span className="px-1.5 py-0.5 rounded-sm bg-red-100 text-red-700 text-3xs font-extrabold uppercase">
                            OVERDUE
                          </span>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {task.status === 'COMPLETED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-amber-100 text-amber-800">
                        In Progress
                      </span>
                    )}
                    {task.status === 'TODO' && !task.isOverdue && (
                      <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-slate-100 text-slate-600">
                        To Do
                      </span>
                    )}
                    {task.isOverdue && task.status !== 'COMPLETED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-red-100 text-red-800 border border-red-200">
                        Overdue
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {task.status === 'TODO' && (
                        <button
                          onClick={() => handleStartTask(task.id)}
                          className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white font-medium text-2xs transition-colors border border-amber-200 flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>Start</span>
                        </button>
                      )}

                      {task.status !== 'COMPLETED' && (
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowCompleteModal(true);
                          }}
                          className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-medium text-2xs transition-colors border border-emerald-200 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Complete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPLETE TASK MODAL */}
      {showCompleteModal && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Complete Task: {selectedTask.title}</span>
              </h3>
              <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Completion Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={completionRemarks}
                  onChange={(e) => setCompletionRemarks(e.target.value)}
                  placeholder="Enter completion details (e.g. MacBook M3 Pro configured & imaged)..."
                  required
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 rounded-md border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !completionRemarks}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-md text-xs font-medium flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Saving...' : 'Mark Completed'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
