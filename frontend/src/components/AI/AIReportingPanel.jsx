import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle2, ChevronDown, ActivitySquare, Check, FileText, CheckSquare, XSquare, MessageSquare } from 'lucide-react';
import { cn } from '../../utils/cn';

const AIReportingPanel = ({ patient }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportReady, setReportReady] = useState(false);

    useEffect(() => {
        if (patient) {
            if (patient.aiFlag) {
                setReportReady(true);
                setIsGenerating(false);
            } else {
                setReportReady(false);
                setIsGenerating(true);
                // Mock generation time
                const timer = setTimeout(() => {
                    setIsGenerating(false);
                    setReportReady(true);
                }, 3000);
                return () => clearTimeout(timer);
            }
        } else {
            setReportReady(false);
            setIsGenerating(false);
        }
    }, [patient]);

    if (!patient) {
        return (
            <aside className="w-96 bg-surface border-l border-[#27272a] flex flex-col shadow-[0_0_15px_-3px_rgba(0,0,0,0.5)] z-20">
                <div className="p-5 border-b border-[#27272a] bg-[#27272a]/50 flex items-center gap-3">
                    <Brain className="w-6 h-6 text-text-tertiary" />
                    <div>
                        <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">AI Protocol</h2>
                        <p className="text-xs text-text-tertiary mt-0.5">Awaiting Data Input</p>
                    </div>
                </div>
                <div className="flex-1 p-8 text-center flex flex-col items-center justify-center text-text-tertiary bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:16px_16px]">
                    <ActivitySquare className="w-12 h-12 mb-4 opacity-30" />
                    <p className="text-sm">The automated AI reporting system will initialize once a patient is selected and imaging data is loaded.</p>
                </div>
            </aside>
        );
    }

    return (
        <aside className="w-96 bg-surface border-l border-[#27272a] flex flex-col shadow-[0_0_15px_-3px_rgba(0,0,0,0.5)] z-20">
            {/* Header */}
            <div className="p-5 border-b border-[#27272a] bg-gradient-to-r from-medical-900/20 to-surface flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Brain className={cn("w-6 h-6", isGenerating ? "text-medical-500 animate-pulse" : "text-medical-400")} />
                        {isGenerating && (
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medical-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-medical-500"></span>
                            </span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                            Gemini Epikriz
                            {reportReady && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </h2>
                        <p className="text-xs text-medical-400 font-medium mt-0.5">
                            {isGenerating ? "Analyzing Imaging & HL7 Data..." : "Analysis Complete"}
                        </p>
                    </div>
                </div>
                {!isGenerating && reportReady && (
                    <div className="bg-emerald-900/20 text-emerald-400 px-2.5 py-1 rounded text-xs font-bold font-mono border border-emerald-800/50">
                        CONFIDENCE: 98%
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-background/50">
                {isGenerating ? (
                    <div className="flex flex-col gap-4 animate-pulse">
                        <div className="h-4 bg-[#27272a] rounded text-center w-3/4 mx-auto mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-2 bg-[#27272a] rounded"></div>
                            <div className="h-2 bg-[#27272a] rounded"></div>
                            <div className="h-2 bg-[#27272a] rounded w-5/6"></div>
                            <div className="h-2 bg-[#27272a] rounded w-4/6"></div>
                        </div>
                        <div className="mt-8 space-y-3 shrink-0">
                            <div className="h-8 bg-[#27272a] rounded-lg w-1/3"></div>
                            <div className="h-16 bg-[#27272a] rounded-lg"></div>
                        </div>
                    </div>
                ) : reportReady ? (
                    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">

                        {/* Summary Alert */}
                        <div className={cn(
                            "p-4 rounded-xl border relative group",
                            patient.status === 'critical' ? "bg-red-900/20 border-red-800/50 text-red-300" :
                                patient.status === 'warning' ? "bg-amber-900/20 border-amber-800/50 text-amber-300" :
                                    "bg-blue-900/20 border-blue-800/50 text-blue-300"
                        )}>
                            <h3 className="font-bold text-sm flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-text-tertiary" /> AI Summary Findings
                            </h3>
                            <p className="text-sm font-medium leading-relaxed">
                                Suspected opacity observed in the lower left lung lobe. High probability of pneumonia vs pulmonary embolism. Immediate review advised.
                            </p>

                            {/* Doctor Feedback Buttons Overlay */}
                            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="px-2 py-1 bg-[#18181b] border border-[#3f3f46] hover:bg-emerald-900/30 hover:text-emerald-400 hover:border-emerald-800/50 text-text-tertiary rounded-md transition-colors shadow-sm text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" title="Accept Finding">
                                    <CheckSquare className="w-3.5 h-3.5" /> Accept
                                </button>
                                <button className="px-2 py-1 bg-[#18181b] border border-[#3f3f46] hover:bg-red-900/30 hover:text-red-400 hover:border-red-800/50 text-text-tertiary rounded-md transition-colors shadow-sm text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" title="Reject Finding">
                                    <XSquare className="w-3.5 h-3.5" /> Reject
                                </button>
                                <button className="px-2 py-1 bg-[#18181b] border border-[#3f3f46] hover:bg-blue-900/30 hover:text-blue-400 hover:border-blue-800/50 text-text-tertiary rounded-md transition-colors shadow-sm text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" title="Request Explanation / Chat">
                                    <MessageSquare className="w-3.5 h-3.5" /> Discuss
                                </button>
                            </div>
                        </div>

                        {/* Generated Report Text */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Clinical Indication</h4>
                                <p className="text-sm text-text-primary leading-relaxed">{patient.reason}</p>
                            </div>
                            <div className="pt-4 border-t border-[#3f3f46]">
                                <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Detailed Findings</h4>
                                <div className="text-sm text-text-primary leading-relaxed space-y-2">
                                    <p>Heart size is normal. The mediastinal and hilar contours are unremarkable. Pulmonary vasculature is normal.</p>
                                    <p>There is no pleural effusion or pneumothorax.</p>
                                    <p><b>Impression:</b> Depending on clinical presentation, findings suggest acute condition requiring immediate intervention.</p>
                                </div>
                            </div>
                        </div>

                        {/* Extracted ICD-10 Data */}
                        <div className="mt-8 pt-6 border-t border-[#3f3f46]">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Suggested ICD-10</h4>
                                <button className="text-medical-500 text-xs font-medium hover:underline flex items-center gap-1">Alternatives <ChevronDown className="w-3 h-3" /></button>
                            </div>
                            <div className="bg-[#18181b] border text-sm border-medical-500/30 rounded-lg p-3 shadow-[0_0_10px_rgba(59,130,246,0.1)] flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono bg-medical-900/40 text-medical-300 px-2 py-1 rounded text-xs border border-medical-800/50">J18.9</span>
                                    <span className="text-text-primary font-medium group-hover:text-medical-100 transition-colors">Pneumonia, unspecified</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary hover:text-text-primary border border-[#3f3f46] bg-[#27272a] px-2 py-1 rounded transition-colors hidden group-hover:block">Reject</button>
                                    <Check className="w-4 h-4 text-medical-500" />
                                </div>
                            </div>
                        </div>

                    </div>
                ) : null}
            </div>

            {/* Action Area */}
            <div className="p-5 border-t border-[#27272a] bg-surface">
                <button
                    disabled={isGenerating || !reportReady}
                    className={cn(
                        "w-full font-bold py-3.5 rounded-xl text-sm transition-all flex justify-center items-center gap-2 border",
                        isGenerating || !reportReady
                            ? "bg-[#27272a] text-text-tertiary border-[#3f3f46] cursor-not-allowed"
                            : "bg-medical-600 hover:bg-medical-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] border-medical-500"
                    )}
                >
                    {isGenerating ? "Analyzing Data Streams..." : "e-Sign & Send to HBYS"}
                </button>
            </div>
        </aside>
    );
};

export default AIReportingPanel;
