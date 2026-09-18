import React, { useState } from 'react';
import { StationStaff } from '../types';
import { Users, Settings, Clock, CheckCircle2, Plus, Edit2, Trash2, X, Calendar, Briefcase } from 'lucide-react';
import { api } from '../../../services/api';

interface Props {
  staff: StationStaff[];
  setStaff: React.Dispatch<React.SetStateAction<StationStaff[]>>;
}

export const StationManagementView: React.FC<Props> = ({ staff, setStaff }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StationStaff | null>(null);

  // Form State for Add Staff
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<StationStaff['role']>('Pickup Staff');
  const [newShift, setNewShift] = useState('Morning (08:00 - 16:00)');
  const [newStatus, setNewStatus] = useState<StationStaff['status']>('Active');
  const [newTask, setNewTask] = useState('');

  // Form State for Assign Shift / Task
  const [assignShift, setAssignShift] = useState('');
  const [assignTask, setAssignTask] = useState('');
  const [assignStatus, setAssignStatus] = useState<StationStaff['status']>('Active');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newMember: StationStaff = {
      id: `stf-${Date.now()}`,
      name: newName,
      role: newRole,
      shift: newShift,
      status: newStatus,
      currentTask: newTask || undefined
    };
    setStaff(prev => [...prev, newMember]);
    setShowAddModal(false);
    setNewName('');
    setNewTask('');
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setStaff(prev => prev.map(member => 
      member.id === editingStaff.id 
        ? { ...member, shift: assignShift, currentTask: assignTask, status: assignStatus }
        : member
    ));
    setEditingStaff(null);
  };

  const openAssignModal = (member: StationStaff) => {
    setEditingStaff(member);
    setAssignShift(member.shift);
    setAssignTask(member.currentTask || '');
    setAssignStatus(member.status);
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from station staff?`)) {
      try {
        const res = await api.deleteStationStaff(id);
        if (res.success || !res.error) {
          setStaff(prev => prev.filter(m => m.id !== id));
        } else {
          alert(res.error || 'Failed to remove staff member');
        }
      } catch (err: any) {
        alert(err.message || 'Error removing staff member');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 flex flex-col md:flex-row gap-6">
      <div className="md:w-2/3 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
           <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" /> Station Staff & Duty Roster
            </h3>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Staff Member
            </button>
          </div>
          <div className="p-4 overflow-x-auto">
             <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Shift Schedule</th>
                    <th className="pb-3 font-semibold">Status / Current Task</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staff.map(member => (
                    <tr key={member.id} className="hover:bg-slate-50/80">
                      <td className="py-3 font-semibold text-slate-800">{member.name}</td>
                      <td className="py-3 text-slate-600">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium">
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600 text-xs font-mono">{member.shift}</td>
                      <td className="py-3">
                         <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                           member.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                           member.status === 'Available' ? 'bg-blue-100 text-blue-800' :
                           'bg-slate-100 text-slate-600'
                         }`}>
                           {member.status}
                         </span>
                         {member.currentTask && <p className="text-[11px] text-teal-700 font-medium mt-1 flex items-center gap-1"><Briefcase className="w-3 h-3 text-teal-500" /> {member.currentTask}</p>}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openAssignModal(member)}
                            className="p-1.5 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="Assign Task & Shift"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Assign Duty</span>
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(member.id, member.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Remove Staff"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {staff.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">No staff members assigned to this station.</td>
                    </tr>
                  )}
                </tbody>
             </table>
          </div>
        </div>
      </div>

      <div className="md:w-1/3 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
           <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><Settings className="w-5 h-5 text-teal-600" /> Station Profile</h3>
           
           <div className="space-y-4 text-sm">
             <div>
               <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Station Name</p>
               <p className="font-semibold text-slate-900">Dar es Salaam Central</p>
             </div>
             <div>
               <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Station ID</p>
               <p className="font-mono text-slate-900">STA-DAR-001</p>
             </div>
             <div>
               <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Operating Hours</p>
               <p className="font-semibold text-slate-900 flex items-center gap-1.5 mt-1"><Clock className="w-4 h-4 text-slate-400" /> Mon - Sat: 08:00 - 20:00</p>
             </div>
             <div>
               <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-2">Capabilities</p>
               <div className="flex flex-wrap gap-2">
                 <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Returns</span>
                 <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Express</span>
                 <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Cold Storage</span>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* ADD STAFF MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" /> Add New Station Staff
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  placeholder="e.g. Emmanuel M." 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-teal-500 outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <select 
                    value={newRole} 
                    onChange={e => setNewRole(e.target.value as any)} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-teal-500 outline-none"
                  >
                    <option value="Manager">Manager</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Pickup Staff">Pickup Staff</option>
                    <option value="Returns Staff">Returns Staff</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Shift</label>
                  <select 
                    value={newShift} 
                    onChange={e => setNewShift(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-teal-500 outline-none"
                  >
                    <option value="Morning (08:00 - 16:00)">Morning (08:00 - 16:00)</option>
                    <option value="Evening (12:00 - 20:00)">Evening (12:00 - 20:00)</option>
                    <option value="Full Day (08:00 - 20:00)">Full Day (08:00 - 20:00)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Duty / Task Assignment</label>
                <input 
                  type="text" 
                  value={newTask} 
                  onChange={e => setNewTask(e.target.value)} 
                  placeholder="e.g. Customer Handover & Verification" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-teal-500 outline-none" 
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select 
                  value={newStatus} 
                  onChange={e => setNewStatus(e.target.value as any)} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-teal-500 outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Available">Available</option>
                  <option value="Off Duty">Off Duty</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-sm">Save Staff Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN SHIFT & TASK MODAL */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" /> Assign Duty & Shift Schedule
                </h3>
                <p className="text-xs text-slate-500">{editingStaff.name} • {editingStaff.role}</p>
              </div>
              <button onClick={() => setEditingStaff(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Shift Schedule</label>
                <select 
                  value={assignShift} 
                  onChange={e => setAssignShift(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-teal-500 outline-none"
                >
                  <option value="Morning (08:00 - 16:00)">Morning (08:00 - 16:00)</option>
                  <option value="Evening (12:00 - 20:00)">Evening (12:00 - 20:00)</option>
                  <option value="Full Day (08:00 - 20:00)">Full Day (08:00 - 20:00)</option>
                  <option value="Night Shift (20:00 - 08:00)">Night Shift (20:00 - 08:00)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Operational Task</label>
                <input 
                  type="text" 
                  value={assignTask} 
                  onChange={e => setAssignTask(e.target.value)} 
                  placeholder="e.g. Customer Handover Counter B" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-teal-500 outline-none" 
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Staff Status</label>
                <select 
                  value={assignStatus} 
                  onChange={e => setAssignStatus(e.target.value as any)} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-teal-500 outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Available">Available</option>
                  <option value="Off Duty">Off Duty</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditingStaff(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-sm">Update Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
