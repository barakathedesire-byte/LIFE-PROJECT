import React, { useState, useEffect } from 'react';
import { Mail, FileText, Send, CheckCircle2, RefreshCw, X, Sparkles, Shield, UserCheck } from 'lucide-react';

export const GoogleWorkspaceHub: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'gmail' | 'forms'>('gmail');
  const [messages, setMessages] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailForm, setEmailForm] = useState({ recipient: '', subject: '', body: '' });
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchWorkspaceData();
    }
  }, [isOpen]);

  const fetchWorkspaceData = async () => {
    setLoading(true);
    try {
      const [msgRes, formRes] = await Promise.all([
        fetch('/api/workspace/gmail/messages', { headers: { 'Authorization': `Bearer ${localStorage.getItem('lumo_token') || ''}` } }),
        fetch('/api/workspace/forms', { headers: { 'Authorization': `Bearer ${localStorage.getItem('lumo_token') || ''}` } })
      ]);
      const msgData = await msgRes.json();
      const formData = await formRes.json();
      if (msgData.messages) setMessages(msgData.messages);
      if (formData.forms) setForms(formData.forms);
    } catch (err) {
      console.error('Error fetching workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/workspace/gmail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('lumo_token') || ''}`
        },
        body: JSON.stringify(emailForm)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Email successfully transmitted via Gmail API!');
        setEmailForm({ recipient: '', subject: '', body: '' });
        fetchWorkspaceData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error sending email:', err);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm) return;
    try {
      const res = await fetch('/api/workspace/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('lumo_token') || ''}`
        },
        body: JSON.stringify({ formId: selectedForm.formId, responses: formResponses })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setSelectedForm(null);
        setFormResponses({});
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-4xl h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden cursor-default animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#FF6A00] flex items-center justify-center font-bold">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="font-extrabold text-base flex items-center gap-2">
                <span>Google Workspace Integration Hub</span>
                <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Active APIs</span>
              </h2>
              <p className="text-xs text-slate-400">Manage Gmail API notifications and Google Forms KYC / Feedback surveys</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchWorkspaceData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1.5 cursor-pointer"
              title="Refresh Workspace Sync"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Sync</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center gap-2 text-emerald-800 text-xs font-bold">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tabs & Subheader */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('gmail')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'gmail' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail size={15} className="text-red-500" />
              <span>Gmail API Integration ({messages.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('forms')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'forms' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={15} className="text-blue-500" />
              <span>Google Forms ({forms.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Scopes: <span className="font-mono text-[11px] text-slate-700">gmail.send, gmail.readonly, forms.body</span>
          </div>
        </div>

        {/* Body Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
          {activeTab === 'gmail' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Recent Gmail Messages */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Mail size={16} className="text-red-500" />
                  <span>Recent Gmail API Messages & Notifications</span>
                </h3>

                <div className="space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-orange-300 transition">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{msg.sender}</span>
                        <span className="text-[10px] text-slate-400">{new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <h4 className="font-semibold text-slate-800 text-xs">{msg.subject}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{msg.snippet}</p>
                      <div className="flex items-center gap-1.5 pt-1">
                        {msg.labels.map((lbl: string) => (
                          <span key={lbl} className="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-200">
                            {lbl}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Compose & Send Email via Gmail API */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Send size={16} className="text-[#FF6A00]" />
                  <span>Send Email via Gmail API</span>
                </h3>

                <form onSubmit={handleSendEmail} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Recipient Email Address</label>
                    <input
                      type="email"
                      required
                      value={emailForm.recipient}
                      onChange={e => setEmailForm({ ...emailForm, recipient: e.target.value })}
                      placeholder="customer@example.co.tz"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#FF6A00] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subject Line</label>
                    <input
                      type="text"
                      required
                      value={emailForm.subject}
                      onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })}
                      placeholder="LUMO Order Notification & OTP Dispatch"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#FF6A00] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Body Content</label>
                    <textarea
                      required
                      rows={4}
                      value={emailForm.body}
                      onChange={e => setEmailForm({ ...emailForm, body: e.target.value })}
                      placeholder="Enter message body or notification details..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#FF6A00] outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white font-extrabold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send size={15} />
                    <span>Dispatch via Gmail API</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'forms' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />
                <span>Google Forms Integration (KYC & Customer Surveys)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {forms.map(form => (
                  <div key={form.formId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full uppercase">
                          {form.status}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">{form.responseCount} Responses</span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{form.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{form.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={form.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
                      >
                        Open in Google Forms ↗
                      </a>
                      <button
                        onClick={() => setSelectedForm(form)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-sm"
                      >
                        Fill & Submit Response
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Submission Modal Overlay */}
              {selectedForm && (
                <div className="fixed inset-0 z-65 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Google Form Response</span>
                        <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">{selectedForm.title}</h4>
                      </div>
                      <button onClick={() => setSelectedForm(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
                      {selectedForm.questions.map((q: any) => (
                        <div key={q.id} className="space-y-1">
                          <label className="block font-semibold text-slate-700">{q.question} {q.required && '*'}</label>
                          {q.type === 'textarea' ? (
                            <textarea
                              rows={3}
                              required={q.required}
                              onChange={e => setFormResponses({ ...formResponses, [q.id]: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                              placeholder="Enter your response..."
                            />
                          ) : q.type === 'dropdown' || q.type === 'radio' ? (
                            <select
                              required={q.required}
                              onChange={e => setFormResponses({ ...formResponses, [q.id]: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                            >
                              <option value="">Select option...</option>
                              {q.options.map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              required={q.required}
                              onChange={e => setFormResponses({ ...formResponses, [q.id]: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="Enter text..."
                            />
                          )}
                        </div>
                      ))}

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedForm(null)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-md cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={15} />
                          <span>Submit Form Response</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
