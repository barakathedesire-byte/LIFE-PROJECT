import React, { useState } from 'react';
import { Users, Filter, CheckCircle2, X, Briefcase, UserCheck } from 'lucide-react';
import { WHStaff } from '../types';

interface StaffViewProps {
  staff: WHStaff[];
}

export const StaffView: React.FC<StaffViewProps> = ({ staff: initialStaff }) => {
  const [staff, setStaff] = useState<WHStaff[]>(initialStaff);
  const [selectedStaff, setSelectedStaff] = useState<WHStaff | null>(null);
  const [assignedTask, setAssignedTask] = useState('Zone A Wave Picking');
  const [shiftValue, setShiftValue] = useState<'MORNING' | 'EVENING' | 'NIGHT'>('MORNING');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    setStaff(prev => prev.map(member => {
      if (member.id === selectedStaff.id) {
        return {
          ...member,
          currentTask: assignedTask,
          shift: shiftValue,
          status: 'ACTIVE'
        };
      }
      return member;
    }));

    showToast(`Assigned task "${assignedTask}" to ${selectedStaff.name}.`);
    setSelectedStaff(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in h-full flex flex-col">
      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-between animate-in fade-in sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="p-1 hover:bg-emerald-700 rounded"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Warehouse Staff & Active Floor Roster</h2>
          <p className="text-xs text-slate-500 mt-1">Manage pickers, packers, QC inspectors, shift allocations, and active tasks.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 z-10 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Primary Role</th>
                <th className="py-3 px-4">Shift Schedule</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Current Station / Task</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {staff.map(member => (
                <tr key={member.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-xs">{member.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">{member.role}</span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">{member.shift}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      member.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                      member.status === 'BREAK' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    {member.currentTask ? (
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">{member.currentTask}</span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button 
                      onClick={() => {
                        setSelectedStaff(member);
                        setAssignedTask(member.currentTask || 'Zone A Wave Picking');
                        setShiftValue(member.shift);
                      }}
                      className="px-3 py-1.5 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs"
                    >
                      Assign Task
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASSIGN TASK MODAL */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAssignSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <Briefcase size={18} className="text-[#FF6A00]" />
                <span>Assign Task to {selectedStaff.name}</span>
              </div>
              <button type="button" onClick={() => setSelectedStaff(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={18} /></button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="font-bold text-slate-900 text-xs">{selectedStaff.name}</p>
              <p className="text-slate-500 font-mono text-[10px]">Role: {selectedStaff.role} • Current Status: {selectedStaff.status}</p>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Select Active Warehouse Task</label>
              <select
                value={assignedTask}
                onChange={e => setAssignedTask(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white outline-none"
              >
                <option value="Zone A Wave Picking">Zone A - Electronics Fast Picking</option>
                <option value="Zone B Wave Picking">Zone B - General Merch Picking</option>
                <option value="Station 1 Quality Check">Station 1 - Quality Check & Warranty Verification</option>
                <option value="Express Packing Bay">Express Packing Bay - Urgent SLAs</option>
                <option value="Dispatch Staging Handover">Dispatch Staging Handover - Courier Loading</option>
                <option value="Cycle Count Audit">Cycle Count Audit - Zone C Pallets</option>
                <option value="Returns Inspection Queue">Returns Inspection Queue - Reverse Logistics</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Shift Schedule</label>
              <select
                value={shiftValue}
                onChange={e => setShiftValue(e.target.value as any)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white outline-none"
              >
                <option value="MORNING">Morning Shift (06:00 - 14:00)</option>
                <option value="EVENING">Evening Shift (14:00 - 22:00)</option>
                <option value="NIGHT">Night Shift (22:00 - 06:00)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedStaff(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FF6A00] hover:bg-[#E55E00] text-white font-bold rounded-xl transition cursor-pointer"
              >
                Confirm Allocation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
