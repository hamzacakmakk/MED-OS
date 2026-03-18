import React, { useState } from 'react';
import { Search, Filter, AlertTriangle, Clock, Eye, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';

const mockQueue = [
    { id: 1, name: 'Ahmet Yılmaz', age: 45, gender: 'M', waitTime: '10 min ago', status: 'critical', reason: 'Severe Chest Pain', aiFlag: true, waitUrgent: false },
    { id: 2, name: 'Ayşe Kaya', age: 32, gender: 'F', waitTime: '25 min ago', status: 'warning', reason: 'Knee Trauma, suspected fracture', aiFlag: false, waitUrgent: true },
    { id: 3, name: 'Mehmet Demir', age: 68, gender: 'M', waitTime: '45 min ago', status: 'normal', reason: 'Routine MRI Follow-up', aiFlag: false, waitUrgent: true },
    { id: 4, name: 'Fatma Şahin', age: 24, gender: 'F', waitTime: '1 hr ago', status: 'normal', reason: 'Chronic Headache CT', aiFlag: true, waitUrgent: true },
];

const TriageQueue = ({ selectedPatientId, onSelectPatient }) => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <aside className="w-80 bg-surface border-r border-[#27272a] flex flex-col z-10 shadow-sm relative">
            <div className="p-4 border-b border-[#27272a] bg-surface/90 backdrop-blur-sm z-20">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-text-primary tracking-tight">Active Triage</h2>
                    <span className="bg-medical-900/40 text-medical-300 border border-medical-800/50 text-xs px-2.5 py-1 rounded-full font-bold">
                        {mockQueue.length} Wait
                    </span>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                        <input
                            type="text"
                            placeholder="Search ID/Name..."
                            className="w-full bg-[#09090b] border border-[#27272a] text-text-primary rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-medical-500 focus:border-medical-500 transition-all placeholder:text-text-tertiary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="p-2 border border-[#27272a] rounded-lg text-text-secondary hover:bg-[#27272a] transition-colors bg-[#09090b]">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                {mockQueue.map((patient) => (
                    <div
                        key={patient.id}
                        onClick={() => onSelectPatient(patient.id)}
                        className={cn(
                            "p-3 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden group",
                            selectedPatientId === patient.id
                                ? "border-medical-500 bg-medical-900/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                                : "border-[#27272a] bg-[#09090b] hover:border-medical-600/50 hover:bg-[#18181b]"
                        )}
                    >
                        {/* Status indicator line */}
                        <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1",
                            patient.status === 'critical' ? "bg-danger" :
                                patient.status === 'warning' ? "bg-warning" : "bg-medical-400"
                        )} />

                        <div className="flex justify-between items-start pl-2 mb-1">
                            <div>
                                <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2 group-hover:text-medical-100 transition-colors">
                                    {patient.name}
                                    {patient.aiFlag && (
                                        <span title="AI Pre-analysis Complete" className="bg-purple-900/40 text-purple-300 border border-purple-800/50 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">AI Ready</span>
                                    )}
                                </h3>
                                <p className="text-xs text-text-secondary mt-0.5">{patient.age}y • {patient.gender}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={cn(
                                    "flex items-center gap-1 text-[10px] font-medium whitespace-nowrap",
                                    patient.waitUrgent ? "text-amber-500 animate-pulse" : "text-text-tertiary"
                                )}>
                                    <Clock className="w-3 h-3" /> {patient.waitTime}
                                </span>
                            </div>
                        </div>

                        <div className="pl-2 mt-2 pt-2 border-t border-[#27272a] border-dashed flex items-start gap-2 relative">
                            {patient.status === 'critical' && <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />}
                            <p className="text-xs text-text-secondary line-clamp-2 pr-8">{patient.reason}</p>
                            {/* Hover Quick Actions */}
                            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#18181b] via-[#18181b] to-transparent flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 bg-[#27272a] hover:bg-medical-600 hover:text-white rounded-md text-text-secondary transition-colors" title="Quick Peek">
                                    <Eye className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                        {/* Hover Overlay Stat/Acil toggle hint */}
                        <div className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden group-hover:flex md:hidden">
                            <button className="flex items-center gap-1.5 bg-danger/20 text-danger border border-danger/50 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                                <Zap className="w-3.5 h-3.5 fill-current" /> STAT / ACİL
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default TriageQueue;
