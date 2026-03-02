import React from 'react';
import { Activity, Droplet, AlertCircle, FileSignature, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

const PatientHeader = ({ patient }) => {
    if (!patient) return null;

    return (
        <header className="bg-surface border-b border-[#27272a] shadow-sm z-10 p-5 flex items-start sm:items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-6 flex-1 min-w-[300px]">
                <div className="w-16 h-16 rounded-2xl bg-medical-900/40 border-2 border-medical-800 flex items-center justify-center font-bold text-2xl text-medical-300 tracking-tighter shadow-sm shrink-0">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                </div>

                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight">{patient.name}</h1>
                        <span className="bg-[#27272a] text-text-secondary px-2 py-0.5 rounded text-xs font-mono font-medium border border-[#3f3f46]">
                            ID: RW-{Math.floor(Math.random() * 90000) + 10000}
                        </span>
                    </div>
                    <div className="flex z-10 flex-wrap items-center gap-x-4 gap-y-2 mt-1.5 text-sm text-text-secondary w-full">
                        <span className="flex items-center gap-1.5 whitespace-nowrap"><Activity className="w-4 h-4 text-medical-500" /> HR: 110 bpm <TrendingUp className="w-4 h-4 text-amber-500 ml-1/2" title="Rising Trend" /></span>
                        <span className="hidden xl:block w-1 h-1 rounded-full bg-[#3f3f46]"></span>
                        <span className="flex items-center gap-1.5 whitespace-nowrap"><Activity className="w-4 h-4 text-emerald-500" /> BP: 120/80 <TrendingDown className="w-4 h-4 text-emerald-500 ml-1/2" title="Dropping/Stable" /></span>
                        <span className="hidden xl:block w-1 h-1 rounded-full bg-[#3f3f46]"></span>
                        <span className="flex items-center gap-1.5 whitespace-nowrap"><Droplet className="w-4 h-4 text-medical-500" /> A+ Blood</span>
                        <span className="hidden lg:block w-1 h-1 rounded-full bg-[#3f3f46]"></span>
                        <span className="flex items-center gap-1.5 whitespace-nowrap bg-red-900/40 text-red-400 border border-red-800/50 px-2 py-0.5 rounded text-xs font-bold shadow-sm uppercase tracking-wide animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" /> Penicillin Allergy
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 relative z-10 shrink-0">
                <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-[#3f3f46] rounded-lg text-sm font-medium text-text-secondary hover:bg-[#27272a] transition-colors shadow-sm whitespace-nowrap">
                    <FileSignature className="w-4 h-4" />
                    History
                </button>
                <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2 bg-medical-900/30 border border-medical-800 rounded-lg text-sm font-bold text-medical-400 hover:bg-medical-900/60 transition-colors shadow-sm whitespace-nowrap">
                        HL7 / FHIR Data
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default PatientHeader;
