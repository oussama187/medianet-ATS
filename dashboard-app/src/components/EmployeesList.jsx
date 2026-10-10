import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Mail, Calendar, Building, MapPin, Award, DollarSign, Edit2, Check, X, Filter } from 'lucide-react';
import { updateEmployee } from '../utils/api';
import './EmployeesList.css';

const EmployeesList = () => {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingSalaryId, setEditingSalaryId] = useState(null);
    const [editSalaryValue, setEditSalaryValue] = useState('');
    const [selectedDeptId, setSelectedDeptId] = useState('all');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://localhost:8000/api/employees', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            console.error('Failed to load employees', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditSalary = (emp) => {
        setEditingSalaryId(emp.id);
        setEditSalaryValue(emp.salary || '');
    };

    const handleSaveSalary = async (empId) => {
        try {
            await updateEmployee(empId, { salary: editSalaryValue });
            setEmployees(employees.map(e => e.id === empId ? { ...e, salary: editSalaryValue } : e));
            setEditingSalaryId(null);
        } catch (error) {
            console.error('Failed to update salary');
        }
    };

    const departments = [];
    const deptMap = new Map();
    employees.forEach(emp => {
        if (emp.department && !deptMap.has(emp.department.id)) {
            deptMap.set(emp.department.id, true);
            departments.push(emp.department);
        }
    });

    const filteredEmployees = employees.filter(emp => 
        selectedDeptId === 'all' || emp.department_id?.toString() === selectedDeptId.toString()
    );

    if (isLoading) {
        return (
            <div className="employees-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="employees-container">
            <div className="employees-header">
                <div className="employees-title-area">
                    <div className="employees-icon-wrapper">
                        <Users size={32} />
                    </div>
                    <div>
                        <h1>Current Employees</h1>
                        <p>A directory of all active team members across departments.</p>
                    </div>
                </div>

                <div style={{ background: 'white', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={16} /> Department
                    </label>
                    <select 
                        value={selectedDeptId} 
                        onChange={(e) => setSelectedDeptId(e.target.value)}
                        style={{ border: 'none', background: 'transparent', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', outline: 'none', cursor: 'pointer' }}
                    >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredEmployees.length > 0 ? (
                <div className="employees-grid">
                    {filteredEmployees.map((emp) => (
                        <div key={emp.id} className="employee-card">
                            <div className="department-badge">
                                <Building size={12} />
                                {emp.department?.name || 'Cross-Functional'}
                            </div>

                            <div className="employee-profile">
                                <div className="employee-avatar">
                                    {emp.first_name.charAt(0)}{emp.last_name.charAt(0)}
                                </div>
                                <div className="employee-info">
                                    <h3>{emp.first_name} {emp.last_name}</h3>
                                    <div className="job-title">{emp.job_title}</div>
                                </div>
                            </div>

                            <div className="employee-details">
                                <div className="detail-item">
                                    <div className="detail-icon"><Briefcase size={16} /></div>
                                    Full-Time Employee
                                </div>
                                <div className="detail-item">
                                    <div className="detail-icon"><Mail size={16} /></div>
                                    {emp.email}
                                </div>
                                <div className="detail-item" style={{ justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div className="detail-icon"><DollarSign size={16} /></div>
                                        {editingSalaryId === emp.id ? (
                                            <input 
                                                autoFocus
                                                type="text" 
                                                value={editSalaryValue}
                                                onChange={(e) => setEditSalaryValue(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveSalary(emp.id)}
                                                style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 6px', width: '100px', fontSize: '0.875rem' }}
                                                placeholder="e.g. $120,000"
                                            />
                                        ) : (
                                            <span>{emp.salary || 'Not specified'}</span>
                                        )}
                                    </div>
                                    {editingSalaryId === emp.id ? (
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button onClick={() => handleSaveSalary(emp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', padding: '2px' }}><Check size={14} /></button>
                                            <button onClick={() => setEditingSalaryId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px' }}><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleEditSalary(emp)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }} title="Edit Salary">
                                            <Edit2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="employee-actions">
                                <div className="hired-badge">
                                    <Award size={14} />
                                    Hired {new Date(emp.hired_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </div>
                                <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${emp.email}`} target="_blank" rel="noopener noreferrer" className="email-btn">
                                    <Mail size={14} /> Contact
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
                    <div style={{ width: '80px', height: '80px', background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                        <Users size={40} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '0.5rem' }}>Your team is growing</h3>
                    <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>When candidates pass all stages of your recruitment pipeline and are marked as "Accepted", they will automatically appear in this directory.</p>
                </div>
            )}
        </div>
    );
};

export default EmployeesList;
