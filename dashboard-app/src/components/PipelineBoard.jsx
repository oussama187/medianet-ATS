import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, X, MoreVertical, UserPlus, Search, Download, Calendar, CheckCircle, XCircle, MessageSquare, FileText, Sparkles } from 'lucide-react';
import { 
    fetchPipelineSteps, 
    fetchCandidates, 
    updateCandidateStep, 
    updateCandidateInterview,
    updateCandidateStatus,
    createPipelineStep, 
    deletePipelineStep,
    updatePipelineStep,
    fetchDepartments,
    fetchCandidateNotes,
    createCandidateNote
} from '../utils/api';
import './PipelineBoard.css';
import { ParsedCvModal } from './CandidatesList';

const PipelineBoard = () => {
    const [steps, setSteps] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingStep, setIsAddingStep] = useState(false);
    const [newStepName, setNewStepName] = useState('');
    const [isInterviewStep, setIsInterviewStep] = useState(false);
    const [showAddCandidateModal, setShowAddCandidateModal] = useState(null); // Step ID
    const [showNotesModal, setShowNotesModal] = useState(null); // Candidate object
    const [selectedCandidateForParse, setSelectedCandidateForParse] = useState(null); // Candidate object
    const [searchQuery, setSearchQuery] = useState('');
    const [departments, setDepartments] = useState([]);
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const depts = await fetchDepartments();
                setDepartments(depts);
                if (depts.length > 0) {
                    setSelectedDeptId(depts[0].id.toString());
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Failed to load departments', error);
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedDeptId) {
            loadData();
        }
    }, [selectedDeptId]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [stepsData, candidatesData] = await Promise.all([
                fetchPipelineSteps(selectedDeptId),
                fetchCandidates()
            ]);
            setSteps(stepsData);
            // Filter candidates by selected department
            const filteredCandidates = candidatesData.filter(c => 
                c.job_listing?.department_id?.toString() === selectedDeptId.toString()
            );
            setCandidates(filteredCandidates);
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onDragEnd = async (result) => {
        const { destination, source, draggableId, type } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        if (type === 'column') {
            const newSteps = Array.from(steps);
            const [removed] = newSteps.splice(source.index, 1);
            newSteps.splice(destination.index, 0, removed);
            
            const updatedSteps = newSteps.map((step, index) => ({
                ...step,
                order: index
            }));

            setSteps(updatedSteps);

            try {
                await Promise.all(
                    updatedSteps.map(step => updatePipelineStep(step.id, { order: step.order }))
                );
            } catch (error) {
                console.error('Failed to update step order', error);
                loadData();
            }
            return;
        }

        // Handle moving candidates
        if (type === 'candidate') {
            const candidateId = draggableId.split('-')[1];
            const newStepId = destination.droppableId.split('-')[1];

            // Optimistic update
            const updatedCandidates = candidates.map(c => 
                c.id.toString() === candidateId 
                    ? { ...c, pipeline_step_id: parseInt(newStepId) } 
                    : c
            );
            setCandidates(updatedCandidates);

            try {
                await updateCandidateStep(candidateId, newStepId);
            } catch (error) {
                console.error('Failed to update candidate step', error);
                loadData(); // Revert on failure
            }
        }
    };

    const handleUpdateInterview = async (candidateId, date) => {
        try {
            await updateCandidateInterview(candidateId, date);
            setCandidates(candidates.map(c => c.id === candidateId ? { ...c, interview_date: date } : c));
        } catch (error) {
            console.error('Failed to update interview date', error);
        }
    };

    const handleUpdateStatus = async (candidateId, status) => {
        try {
            await updateCandidateStatus(candidateId, status);
            setToast({ show: true, message: `Candidate successfully ${status}!`, type: 'success' });
            setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
            setCandidates(candidates.filter(c => c.id !== candidateId));
        } catch (error) {
            console.error('Failed to update candidate status', error);
            setToast({ show: true, message: 'Failed to update candidate status', type: 'error' });
            setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 3000);
        }
    };

    const handleAddStep = async (e) => {
        e.preventDefault();
        if (!newStepName.trim()) return;

        try {
            const newStep = await createPipelineStep({
                name: newStepName,
                order: steps.length,
                color: getRandomColor(),
                department_id: selectedDeptId,
                is_interview: isInterviewStep
            });
            setSteps([...steps, newStep]);
            setNewStepName('');
            setIsInterviewStep(false);
            setIsAddingStep(false);
        } catch (error) {
            console.error('Failed to create step', error);
        }
    };

    const handleDeleteStep = async (stepId) => {
        try {
            await deletePipelineStep(stepId);
            setSteps(steps.filter(s => s.id !== stepId));
            // Update local candidates
            setCandidates(candidates.map(c => 
                c.pipeline_step_id === stepId ? { ...c, pipeline_step_id: null } : c
            ));
        } catch (error) {
            console.error('Failed to delete step', error);
        }
    };

    const getRandomColor = () => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const getCandidatesInStep = (stepId) => {
        return candidates.filter(c => c.pipeline_step_id === stepId);
    };

    if (isLoading) return <div className="loading">Loading Pipeline...</div>;

    return (
        <div className="pipeline-wrapper">
            <div className="pipeline-header">
                <div className="header-info">
                    <h1>Recruitment Pipeline</h1>
                    <div className="dept-selector-wrapper">
                        <label>Department:</label>
                        <select 
                            value={selectedDeptId} 
                            onChange={(e) => setSelectedDeptId(e.target.value)}
                            className="dept-select"
                        >
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="header-actions">
                    <button 
                        className="add-step-btn" 
                        onClick={() => setIsAddingStep(true)}
                        disabled={!selectedDeptId}
                    >
                        <Plus size={18} /> Add Step
                    </button>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="board" type="column" direction="horizontal">
                    {(provided) => (
                        <div 
                            className="pipeline-container"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {steps.map((step, index) => (
                                <Draggable key={step.id} draggableId={`col-${step.id}`} index={index}>
                                    {(provided) => (
                                        <StepColumn 
                                            id={step.id.toString()}
                                            name={step.name}
                                            color={step.color}
                                            candidates={getCandidatesInStep(step.id)}
                                            onDelete={() => handleDeleteStep(step.id)}
                                            onAddCandidate={() => setShowAddCandidateModal(step.id)}
                                            onUpdateInterview={handleUpdateInterview}
                                            onUpdateStatus={handleUpdateStatus}
                                            onOpenNotes={(candidate) => setShowNotesModal(candidate)}
                                            onOpenParse={(candidate) => setSelectedCandidateForParse(candidate)}
                                            provided={provided}
                                            isInterviewProp={step.is_interview}
                                        />
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}

                            {isAddingStep && (
                                <div className="add-step-form">
                                    <form onSubmit={handleAddStep}>
                                        <input 
                                            autoFocus
                                            type="text" 
                                            placeholder="Step Name..." 
                                            value={newStepName}
                                            onChange={(e) => setNewStepName(e.target.value)}
                                        />
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#475569', cursor: 'pointer' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={isInterviewStep} 
                                                onChange={(e) => setIsInterviewStep(e.target.checked)} 
                                                style={{ width: 'auto', marginBottom: 0 }}
                                            />
                                            This is an interview phase
                                        </label>
                                        <div className="form-actions">
                                            <button type="submit" className="save-btn">Save</button>
                                            <button type="button" className="cancel-btn" onClick={() => { setIsAddingStep(false); setIsInterviewStep(false); }}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {showAddCandidateModal !== null && (
                <AddCandidateModal 
                    onClose={() => setShowAddCandidateModal(null)}
                    onAdd={async (candidateId) => {
                        try {
                            const stepId = showAddCandidateModal;
                            await updateCandidateStep(candidateId, stepId);
                            setCandidates(candidates.map(c => 
                                c.id === candidateId ? { ...c, pipeline_step_id: stepId } : c
                            ));
                            setShowAddCandidateModal(null);
                        } catch (error) {
                            console.error('Failed to add candidate to step', error);
                        }
                    }}
                    allCandidates={candidates}
                    currentStepId={showAddCandidateModal}
                />
            )}

            {showNotesModal && (
                <CandidateNotesModal 
                    candidate={showNotesModal}
                    onClose={() => setShowNotesModal(null)}
                />
            )}

            {selectedCandidateForParse && (
                <ParsedCvModal 
                    candidate={selectedCandidateForParse} 
                    onClose={() => setSelectedCandidateForParse(null)} 
                />
            )}

            {toast.show && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    zIndex: 9999,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    {toast.message}
                </div>
            )}
        </div>
    );
};

const StepColumn = ({ id, name, candidates, color, onDelete, onAddCandidate, onUpdateInterview, onUpdateStatus, onOpenNotes, onOpenParse, provided, isInterviewProp }) => {
    const isInterview = isInterviewProp || name.toLowerCase().includes('interview');
    
    return (
        <div 
            className="pipeline-column"
            ref={provided.innerRef}
            {...provided.draggableProps}
        >
            <div 
                className="column-header" 
                style={{ borderTop: `4px solid ${color || '#94a3b8'}` }}
                {...provided.dragHandleProps}
            >
                <div className="header-left">
                    <h3>{name}</h3>
                    <span className="count">{candidates.length}</span>
                </div>
                <div className="header-right">
                    <button className="icon-btn" onClick={onAddCandidate} title="Add Candidate to Stage">
                        <UserPlus size={16} />
                    </button>
                    {onDelete && (
                        <button className="icon-btn delete" onClick={onDelete}>
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            <Droppable droppableId={`step-${id}`} type="candidate">
                {(provided, snapshot) => (
                    <div 
                        className={`column-body ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {candidates.map((candidate, index) => (
                            <CandidateCard 
                                key={candidate.id} 
                                candidate={candidate} 
                                index={index} 
                                isInterview={isInterview}
                                onUpdateInterview={onUpdateInterview}
                                onUpdateStatus={onUpdateStatus}
                                onOpenNotes={() => onOpenNotes(candidate)}
                                onOpenParse={() => onOpenParse(candidate)}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

const CandidateCard = ({ candidate, index, isInterview, onUpdateInterview, onUpdateStatus, onOpenNotes, onOpenParse }) => {
    const [interviewDate, setInterviewDate] = useState(candidate.interview_date ? candidate.interview_date.substring(0, 16) : '');
    return (
        <Draggable draggableId={`candidate-${candidate.id}`} index={index}>
            {(provided, snapshot) => (
                <div 
                    className={`candidate-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <div className="card-top" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <div className="avatar">
                                {candidate.first_name.charAt(0)}{candidate.last_name.charAt(0)}
                            </div>
                            <div className="name-info">
                                <h4>{candidate.first_name} {candidate.last_name}</h4>
                                <span>{candidate.job_listing?.title || 'Unknown Job'}</span>
                            </div>
                        </div>
                        {candidate.match_score !== null && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                background: candidate.match_score > 75 ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : candidate.match_score > 40 ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                                border: `1px solid ${candidate.match_score > 75 ? '#bbf7d0' : candidate.match_score > 40 ? '#fde68a' : '#fecaca'}`,
                                padding: '0.25rem 0.5rem',
                                borderRadius: '20px',
                                color: candidate.match_score > 75 ? '#166534' : candidate.match_score > 40 ? '#92400e' : '#991b1b',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                boxShadow: `0 2px 4px ${candidate.match_score > 75 ? 'rgba(34, 197, 94, 0.1)' : candidate.match_score > 40 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
                                alignSelf: 'flex-start'
                            }}>
                                <Sparkles size={10} style={{ color: candidate.match_score > 75 ? '#22c55e' : candidate.match_score > 40 ? '#f59e0b' : '#ef4444' }} />
                                {candidate.match_score}%
                            </div>
                        )}
                    </div>
                    <div className="card-meta">
                        <div className="meta-item">
                            <Plus size={12} /> {new Date(candidate.created_at).toLocaleDateString()}
                        </div>
                        {candidate.resume_url && (
                            <a href={`http://localhost:8000${candidate.resume_url}`} target="_blank" rel="noopener noreferrer" className="cv-link">
                                <Download size={14} /> CV
                            </a>
                        )}
                        <button onClick={onOpenNotes} className="cv-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#64748b' }}>
                            <MessageSquare size={14} /> Notes
                        </button>
                        <button onClick={onOpenParse} className="cv-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#8b5cf6', fontWeight: 600 }}>
                            <FileText size={14} /> Parse
                        </button>
                    </div>
                    {isInterview && (
                        <div className="interview-scheduler" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                            <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                                <Calendar size={12} /> Schedule Interview
                            </label>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <input 
                                    type="datetime-local" 
                                    value={interviewDate}
                                    onChange={(e) => setInterviewDate(e.target.value)}
                                    style={{ flex: 1, fontSize: '0.75rem', padding: '0.25rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                />
                                <button 
                                    onClick={() => onUpdateInterview && onUpdateInterview(candidate.id, interviewDate)}
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                                    title="Confirm and send to n8n calendar"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    )}
                    {candidate.note && (
                        <p className="card-note">{candidate.note.substring(0, 50)}...</p>
                    )}
                    <div className="status-actions" style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                        <button 
                            onClick={() => onUpdateStatus && onUpdateStatus(candidate.id, 'accepted')}
                            style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', background: candidate.status === 'accepted' ? '#10b981' : 'transparent', color: candidate.status === 'accepted' ? 'white' : '#10b981', border: '1px solid #10b981', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                        >
                            <CheckCircle size={14} /> Accept
                        </button>
                        <button 
                            onClick={() => onUpdateStatus && onUpdateStatus(candidate.id, 'rejected')}
                            style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', background: candidate.status === 'rejected' ? '#ef4444' : 'transparent', color: candidate.status === 'rejected' ? 'white' : '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                        >
                            <XCircle size={14} /> Drop
                        </button>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

const AddCandidateModal = ({ onClose, onAdd, allCandidates, currentStepId }) => {
    const [query, setQuery] = useState('');
    
    // Candidates NOT in the current step
    const availableCandidates = allCandidates.filter(c => {
        const belongsToCurrent = c.pipeline_step_id?.toString() === currentStepId.toString();
        
        return !belongsToCurrent && (
            (c.first_name || '').toLowerCase().includes(query.toLowerCase()) ||
            (c.last_name || '').toLowerCase().includes(query.toLowerCase()) ||
            (c.job_listing?.title || '').toLowerCase().includes(query.toLowerCase())
        );
    });

    return (
        <div className="modal-overlay">
            <div className="pipeline-modal">
                <div className="modal-header">
                    <h2>Add Candidate to Stage</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <div className="search-box">
                        <Search size={18} />
                        <input 
                            type="text" 
                            placeholder="Find a candidate..." 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div className="candidate-selection-list">
                        {availableCandidates.length > 0 ? (
                            availableCandidates.map(c => (
                                <div key={c.id} className="selection-item" onClick={() => onAdd(c.id)}>
                                    <div className="item-avatar">
                                        {c.first_name.charAt(0)}{c.last_name.charAt(0)}
                                    </div>
                                    <div className="item-info">
                                        <h4>{c.first_name} {c.last_name}</h4>
                                        <p>{c.job_listing?.title}</p>
                                    </div>
                                    <Plus size={18} className="add-icon" />
                                </div>
                            ))
                        ) : (
                            <p className="no-candidates">No candidates found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CandidateNotesModal = ({ candidate, onClose }) => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadNotes();
    }, [candidate]);

    const loadNotes = async () => {
        try {
            setIsLoading(true);
            const data = await fetchCandidateNotes(candidate.id);
            setNotes(data);
        } catch (error) {
            console.error('Failed to load notes', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        try {
            const added = await createCandidateNote(candidate.id, newNote, candidate.pipeline_step_id);
            setNotes([added, ...notes]);
            setNewNote('');
        } catch (error) {
            console.error('Failed to add note', error);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="pipeline-modal" style={{ width: '500px', maxWidth: '90%' }}>
                <div className="modal-header">
                    <h2>Notes for {candidate.first_name} {candidate.last_name}</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                    <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                        <textarea 
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Add a new note..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit', fontSize: '0.875rem' }}
                        />
                        <button type="submit" disabled={!newNote.trim()} style={{ alignSelf: 'flex-end', padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: newNote.trim() ? 'pointer' : 'not-allowed', opacity: newNote.trim() ? 1 : 0.5 }}>
                            Add Note
                        </button>
                    </form>

                    <div className="notes-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {isLoading ? (
                            <div style={{ textAlign: 'center', color: '#64748b' }}>Loading notes...</div>
                        ) : notes.length > 0 ? (
                            notes.map(note => (
                                <div key={note.id} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                                        <strong>{note.user?.name || 'Recruiter'}</strong>
                                        <span>
                                            {new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                        Phase: {note.pipeline_step?.name || 'Unassigned'}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#334155', whiteSpace: 'pre-wrap' }}>
                                        {note.note}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>
                                No notes yet. Add one above!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PipelineBoard;
