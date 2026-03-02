import React, { useState } from 'react';
import TriageQueue from '../components/Sidebar/TriageQueue';
import PatientHeader from '../components/Patient/PatientHeader';
import ViewerWorkspace from '../components/Imaging/ViewerWorkspace';
import AIReportingPanel from '../components/AI/AIReportingPanel';

const mockPatients = {
    1: { id: 1, name: 'Ahmet Yılmaz', age: 45, gender: 'M', reason: 'Severe Chest Pain', status: 'critical', aiFlag: true },
    2: { id: 2, name: 'Ayşe Kaya', age: 32, gender: 'F', reason: 'Knee Trauma, suspected fracture', status: 'warning', aiFlag: false },
    3: { id: 3, name: 'Mehmet Demir', age: 68, gender: 'M', reason: 'Routine MRI Follow-up', status: 'normal', aiFlag: false },
    4: { id: 4, name: 'Fatma Şahin', age: 24, gender: 'F', reason: 'Chronic Headache CT', status: 'normal', aiFlag: true },
};

const Dashboard = () => {
    const [selectedPatientId, setSelectedPatientId] = useState(null);

    const selectedPatient = selectedPatientId ? mockPatients[selectedPatientId] : null;

    return (
        <div className="flex w-full h-full bg-background overflow-hidden relative">
            {/* Background ambient gradient for extreme polish */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-medical-900/10 via-background to-background pointer-events-none z-0"></div>

            {/* 2. Left Pane: Patient Triage Queue */}
            <TriageQueue
                selectedPatientId={selectedPatientId}
                onSelectPatient={setSelectedPatientId}
            />

            {/* 3. Center Pane: Context Viewer (Patient details, DICOM, etc.) */}
            <section className="flex-1 flex flex-col z-10 overflow-hidden bg-transparent">
                <PatientHeader patient={selectedPatient} />

                <ViewerWorkspace patient={selectedPatient} />
            </section>

            {/* 4. Right Pane: AI Report Stream */}
            <AIReportingPanel patient={selectedPatient} />
        </div>
    );
};

export default Dashboard;
