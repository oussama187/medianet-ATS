const API_URL = 'http://127.0.0.1:8000/api';

const getHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleResponse = async (response) => {
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    
    if (!response.ok) {
        throw data || { error: 'An error occurred' };
    }
    return data;
};

export const loginAPI = async (credentials) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(credentials),
    });
    return handleResponse(response);
};

export const registerAPI = async (userData) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

export const logoutAPI = async () => {
    const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: getHeaders(),
    });
    return handleResponse(response);
};

export const getUserAPI = async () => {
    const response = await fetch(`${API_URL}/user`, { headers: getHeaders() });
    return handleResponse(response);
};

export const uploadUserResume = async (formData) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/user/resume`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
    });
    return handleResponse(response);
};

export const fetchNotifications = async () => {
    const response = await fetch(`${API_URL}/user/notifications`, { headers: getHeaders() });
    return handleResponse(response);
};

export const markNotificationsRead = async () => {
    const response = await fetch(`${API_URL}/user/notifications/mark-read`, { method: 'POST', headers: getHeaders() });
    return handleResponse(response);
};

export const forgotPasswordAPI = async (email) => {
    const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email }),
    });
    return handleResponse(response);
};

export const resetPasswordAPI = async (data) => {
    const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const fetchDepartments = async () => {
    const response = await fetch(`${API_URL}/departments`, { headers: getHeaders() });
    return handleResponse(response);
};

export const fetchDepartment = async (id) => {
    const response = await fetch(`${API_URL}/departments/${id}`, { headers: getHeaders() });
    return handleResponse(response);
};

export const createDepartment = async (data) => {
    const response = await fetch(`${API_URL}/departments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const updateDepartment = async (id, data) => {
    const response = await fetch(`${API_URL}/departments/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const deleteDepartment = async (id) => {
    const response = await fetch(`${API_URL}/departments/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    return handleResponse(response);
};

export const fetchJobListings = async () => {
    const response = await fetch(`${API_URL}/job-listings`, { headers: getHeaders() });
    return handleResponse(response);
};

export const fetchJobListing = async (id) => {
    const response = await fetch(`${API_URL}/job-listings/${id}`, { headers: getHeaders() });
    return handleResponse(response);
};

export const fetchJobRecommendations = async (formData) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/recommend-jobs`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
    });
    return handleResponse(response);
};

export const createJobListing = async (data) => {
    const response = await fetch(`${API_URL}/job-listings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const updateJobListing = async (id, data) => {
    const response = await fetch(`${API_URL}/job-listings/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const deleteJobListing = async (id) => {
    const response = await fetch(`${API_URL}/job-listings/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    return handleResponse(response);
};

export const fetchRecruiters = async () => {
    const response = await fetch(`${API_URL}/recruiters`, { headers: getHeaders() });
    return handleResponse(response);
};

export const updateRecruiterPermissions = async (id, permissions) => {
    const response = await fetch(`${API_URL}/recruiters/${id}/permissions`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ permissions }),
    });
    return handleResponse(response);
};

export const submitApplication = async (formData) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/apply`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData, // FormData handles its own Content-Type with boundary
    });
    return handleResponse(response);
};

export const fetchCandidates = async () => {
    const response = await fetch(`${API_URL}/candidates`, {
        headers: getHeaders(),
    });
    return handleResponse(response);
};

export const fetchMyApplications = async () => {
    const response = await fetch(`${API_URL}/my-applications`, {
        headers: getHeaders(),
    });
    return handleResponse(response);
};

export const updateCandidateStep = async (candidateId, stepId) => {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/step`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ pipeline_step_id: stepId }),
    });
    return handleResponse(response);
};

export const updateCandidateInterview = async (candidateId, interviewDate) => {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/interview`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ interview_date: interviewDate }),
    });
    return handleResponse(response);
};

export const updateCandidateStatus = async (candidateId, status) => {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
    });
    return handleResponse(response);
};

export const parseCandidateCv = async (candidateId) => {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/parse-cv`, {
        headers: getHeaders(),
    });
    return handleResponse(response);
};

export const sendCandidateEmail = async (candidateId, payload) => {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/email`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
};

export const fetchCandidateNotes = async (candidateId) => {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/notes`, {
        headers: getHeaders(),
    });
    return handleResponse(response);
};

export const updateEmployee = async (id, data) => {
    const response = await fetch(`${API_URL}/employees/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const fetchEmployees = async () => {
    const response = await fetch(`${API_URL}/employees`, {
        headers: getHeaders(),
    });
    return handleResponse(response);
};
export const createCandidateNote = async (candidateId, note, pipelineStepId) => {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/notes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ note, pipeline_step_id: pipelineStepId }),
    });
    return handleResponse(response);
};

export const fetchPipelineSteps = async (departmentId = null) => {
    let url = `${API_URL}/pipeline-steps`;
    if (departmentId) {
        url += `?department_id=${departmentId}`;
    }
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
};

export const createPipelineStep = async (data) => {
    const response = await fetch(`${API_URL}/pipeline-steps`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const updatePipelineStep = async (id, data) => {
    const response = await fetch(`${API_URL}/pipeline-steps/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const deletePipelineStep = async (id) => {
    const response = await fetch(`${API_URL}/pipeline-steps/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    return handleResponse(response);
};
