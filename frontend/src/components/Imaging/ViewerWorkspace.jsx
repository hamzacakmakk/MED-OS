import React, { useState } from 'react';
import { Maximize2, ZoomIn, Contrast, Layout, Settings, SquareActivity, Play, BoxSelect, Layers, Brain, ToggleLeft, ToggleRight, SquareSplitHorizontal } from 'lucide-react';
import { cn } from '../../utils/cn';
import { FileUpload } from '../FileUpload';

const ViewerWorkspace = ({ patient }) => {
    const [aiOverlays, setAiOverlays] = useState({
        boundingBoxes: true,
        heatmap: false
    });

    if (!patient) {
        return (
            <div className="flex-1 m-6 flex flex-col items-center justify-center p-8 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="text-center max-w-xl w-full">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Awaiting Patient Selection</h3>
                    <p className="text-sm text-gray-500 mb-8">
                        Please select a patient from the active triage queue on the left or upload a new X-ray below to initiate the diagnostic workspace.
                    </p>
                    <FileUpload onAnalysisComplete={(result) => console.log('Analysis complete:', result)} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-black m-6 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative group">
            {/* Top Toolbar (Overlay) */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex gap-2">
                    <button className="p-2 bg-gray-800/80 hover:bg-gray-700 text-white rounded-lg backdrop-blur-sm transition-colors" title="Zoom/Pan">
                        <SquareActivity className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-gray-800/80 hover:bg-gray-700 text-white rounded-lg backdrop-blur-sm transition-colors" title="Window Level">
                        <Contrast className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-gray-800/80 hover:bg-gray-700 text-white rounded-lg backdrop-blur-sm transition-colors" title="Magnify">
                        <ZoomIn className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex bg-gray-900/80 text-white rounded-lg overflow-hidden backdrop-blur-sm border border-gray-700">
                    <button className="px-4 py-1.5 text-sm font-medium hover:bg-gray-800 border-r border-gray-700 transition-colors">Axial</button>
                    <button className="px-4 py-1.5 text-sm font-medium hover:bg-gray-800 border-r border-gray-700 transition-colors">Coronal</button>
                    <button className="px-4 py-1.5 text-sm font-medium hover:bg-gray-800 bg-medical-600/50 transition-colors">Sagittal</button>
                </div>

                <button className="p-2 bg-gray-800/80 hover:bg-gray-700 text-white rounded-lg backdrop-blur-sm transition-colors">
                    <Maximize2 className="w-5 h-5" />
                </button>
            </div>

            {/* Main Image Area Placeholder */}
            <div className="flex-1 relative border border-[#27272a] rounded-lg bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#18181b] to-black overflow-hidden flex items-center justify-center">
                <div className="text-center text-[#27272a] select-none pointer-events-none scale-150 font-bold tracking-[0.5em]">
                    DICOM VIEWER PLACEHOLDER
                </div>

                {/* Faux AI Bounding Box (Visible if toggled) */}
                {aiOverlays.boundingBoxes && (
                    <div className="absolute top-1/4 left-1/3 w-32 h-40 border-2 border-dashed border-red-500/70 rounded-md bg-red-500/10 pointer-events-none">
                        <div className="absolute -top-6 left-0 bg-red-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            Suspected Opacity: 98%
                        </div>
                    </div>
                )}

                {/* Floating Controls Overlay (Series info etc) */}
                <div className="absolute bottom-4 left-4 text-xs font-mono text-medical-500/50 space-y-1 select-none pointer-events-none">
                    <p>ID: {patient.name.replace(/\s+/g, '').toUpperCase()}_{Math.floor(Math.random() * 9000) + 1000}</p>
                    <p>WL: 40 WW: 400</p>
                    <p>T: 2.0mm L: 13.5mm</p>
                    <p>Im: 44/120</p>
                    <p>Se: 3</p>
                </div>

                <div className="absolute top-4 right-4 text-xs font-mono text-medical-500/50 text-right select-none pointer-events-none">
                    <p>Roseware AI V2.1</p>
                    <p>HFS</p>
                    <p>KV: 120</p>
                    <p>mA: 250</p>
                </div>

                {/* Doctor AI Tooling Menu (Bottom Right) */}
                <div className="absolute bottom-6 right-6 bg-surface/90 backdrop-blur-md border border-[#3f3f46] p-3 rounded-xl shadow-2xl flex flex-col gap-3 z-20">
                    <div className="flex items-center gap-2 mb-1 border-b border-[#3f3f46] pb-2">
                        <Brain className="w-4 h-4 text-medical-400" />
                        <span className="text-xs font-bold text-text-primary uppercase tracking-wider">AI Overlays</span>
                    </div>

                    {/* Toggle: Bounding Boxes */}
                    <div className="flex items-center justify-between gap-6 cursor-pointer group" onClick={() => setAiOverlays(prev => ({ ...prev, boundingBoxes: !prev.boundingBoxes }))}>
                        <div className="flex items-center gap-2">
                            <BoxSelect className={cn("w-4 h-4 transition-colors", aiOverlays.boundingBoxes ? "text-medical-400" : "text-text-tertiary")} />
                            <span className={cn("text-xs font-medium transition-colors", aiOverlays.boundingBoxes ? "text-text-primary" : "text-text-secondary")}>YOLO Findings</span>
                        </div>
                        {aiOverlays.boundingBoxes ? <ToggleRight className="w-5 h-5 text-medical-500" /> : <ToggleLeft className="w-5 h-5 text-text-tertiary group-hover:text-text-secondary" />}
                    </div>

                    {/* Toggle: Heatmap */}
                    <div className="flex items-center justify-between gap-6 cursor-pointer group" onClick={() => setAiOverlays(prev => ({ ...prev, heatmap: !prev.heatmap }))}>
                        <div className="flex items-center gap-2">
                            <Layers className={cn("w-4 h-4 transition-colors", aiOverlays.heatmap ? "text-purple-400" : "text-text-tertiary")} />
                            <span className={cn("text-xs font-medium transition-colors", aiOverlays.heatmap ? "text-text-primary" : "text-text-secondary")}>Segmentation Heatmap</span>
                        </div>
                        {aiOverlays.heatmap ? <ToggleRight className="w-5 h-5 text-purple-500" /> : <ToggleLeft className="w-5 h-5 text-text-tertiary group-hover:text-text-secondary" />}
                    </div>

                    {/* Compare Mode Button */}
                    <button className="mt-2 w-full flex items-center justify-center gap-2 bg-[#27272a] hover:bg-[#3f3f46] border border-[#3f3f46] text-text-primary text-xs font-medium py-1.5 rounded-lg transition-colors">
                        <SquareSplitHorizontal className="w-3.5 h-3.5" />
                        Compare Prior
                    </button>
                </div>

                <div className="absolute inset-0 flex items-center justify-center gap-6 opacity-0 hover:opacity-100 transition-opacity bg-black/20 z-10">
                    <button className="flex items-center gap-2 text-text-secondary hover:text-white bg-surface/80 px-4 py-2 rounded-lg backdrop-blur-sm border border-[#27272a] transition-colors"><Play className="w-4 h-4" /> Load Series</button>
                    <button className="flex items-center gap-2 text-text-secondary hover:text-white bg-surface/80 px-4 py-2 rounded-lg backdrop-blur-sm border border-[#27272a] transition-colors"><Settings className="w-4 h-4" /> Config</button>
                </div>
            </div>

            {/* Bottom Information Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between text-gray-400 font-mono text-xs z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div>
                    <p>Acq: 2026-03-01</p>
                    <p>Thick: 3.00 mm</p>
                </div>
                <div className="text-right">
                    <p>WL: 40 WW: 400</p>
                    <p>Zoom: 100%</p>
                </div>
            </div>
        </div>
    );
};

export default ViewerWorkspace;
