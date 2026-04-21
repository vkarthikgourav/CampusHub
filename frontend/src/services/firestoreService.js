import { fetchWithAuth } from './api';

export const getAllFees = async () => {
    try {
        return await fetchWithAuth('/fees/all');
    } catch(e) { return []; }
};

export const getStudentFee = async () => {
    try {
        return await fetchWithAuth('/fees/status');
    } catch(e) { return null; }
};

export const updateFee = async (feeId, data) => {
    try {
        await fetchWithAuth('/fees/update', {
            method: 'POST',
            body: JSON.stringify({ student_id: feeId, status: data.status || 'Paid' })
        });
    } catch(e) { console.error(e); }
};

export const getAllComplaints = async () => {
    try {
        return await fetchWithAuth('/complaints');
    } catch(e) { return []; }
};

export const getUserComplaints = async () => {
    try {
       return await fetchWithAuth('/complaints/my');
    } catch(e) { return []; }
};

export const addComplaint = async (complaintData) => {
    try {
        const response = await fetchWithAuth('/complain/submit', {
            method: 'POST',
            body: JSON.stringify({
                category: complaintData.category || 'General',
                subject: complaintData.subject || 'No Subject',
                description: complaintData.description || complaintData.issue || 'No details given'
            })
        });
        return response.id;
    } catch(e) { console.error(e); throw e; }
};

export const updateComplaintStatus = async (complaintId, status) => {
    try {
        await fetchWithAuth(`/complaint/update/${complaintId}?status=${status}`, { method: 'PUT' });
    } catch(e) { console.error(e); }
};

export const deleteComplaint = async (complaintId) => {
    try {
        await fetchWithAuth(`/complaint/delete/${complaintId}`, { method: 'DELETE' });
    } catch(e) { console.error(e); }
};

export const getAllRooms = async () => {
    return [];
};

export const getStudentHostelApp = async () => {
    try {
        return await fetchWithAuth('/hostel/status');
    } catch(e) { return null; }
};

export const applyForRoom = async () => {
    try {
        await fetchWithAuth('/hostel/apply', { method: 'POST' });
    } catch(e) { console.error(e); }
};

export const getDashboardStats = async () => {
    return { students: "0", courses: "0", attendance: "0%", activeComplaints: "0" };
};

// ─── Classes ────────────────────────────────────────
export const getAllClasses = async () => {
    try {
        return await fetchWithAuth('/classes');
    } catch(e) { return []; }
};

export const getMyClasses = async () => {
    try {
        return await fetchWithAuth('/classes/my');
    } catch(e) { return []; }
};

export const addClass = async (classData) => {
    try {
        return await fetchWithAuth('/class/add', {
            method: 'POST',
            body: JSON.stringify(classData)
        });
    } catch(e) { console.error(e); }
};

export const updateClass = async (id, classData) => {
    try {
        return await fetchWithAuth(`/class/${id}`, {
            method: 'PUT',
            body: JSON.stringify(classData)
        });
    } catch(e) { console.error(e); }
};

export const deleteClass = async (id) => {
    try {
        await fetchWithAuth(`/class/${id}`, { method: 'DELETE' });
    } catch(e) { console.error(e); }
};

// ─── Timetable ──────────────────────────────────────
export const getTimetableEntries = async (classId) => {
    try {
        const url = classId ? `/timetable/view?class_id=${classId}` : '/timetable/view';
        return await fetchWithAuth(url);
    } catch(e) { return []; }
};

export const getMyTimetable = async () => {
    try {
        return await fetchWithAuth('/timetable/my');
    } catch(e) { return []; }
};

export const addTimetableEntry = async (entryData) => {
    try {
        return await fetchWithAuth('/timetable/add', {
            method: 'POST',
            body: JSON.stringify(entryData)
        });
    } catch(e) { console.error(e); }
};

export const updateTimetableEntry = async (id, data) => {
    try {
        return await fetchWithAuth(`/timetable/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    } catch(e) { console.error(e); }
};

export const deleteTimetableEntry = async (id) => {
    try {
        await fetchWithAuth(`/timetable/delete/${id}`, { method: 'DELETE' });
    } catch(e) { console.error(e); }
};

// ─── Contacts ───────────────────────────────────────
export const getAllContacts = async () => {
    try {
        return await fetchWithAuth('/contacts');
    } catch(e) { return []; }
};

export const addContact = async (contactData) => {
    try {
        return await fetchWithAuth('/contacts/add', {
            method: 'POST',
            body: JSON.stringify(contactData)
        });
    } catch(e) { console.error(e); }
};

export const deleteContact = async (id) => {
    try {
        await fetchWithAuth(`/contacts/${id}`, { method: 'DELETE' });
    } catch(e) { console.error(e); }
};

// ─── Students & Professors ──────────────────────────
export const getAllStudents = async () => {
    try {
        return await fetchWithAuth('/admin/users/student');
    } catch(e) { return []; }
};

export const getAllProfessors = async () => {
    try {
        return await fetchWithAuth('/admin/users/professor');
    } catch(e) { return []; }
};

// ─── Hostel ─────────────────────────────────────────
export const getAllHostelRooms = async () => {
    try {
        return await fetchWithAuth('/hostel/rooms');
    } catch(e) { return []; }
};

export const getAllHostelApplications = async () => {
    try {
        return await fetchWithAuth('/hostel/applications');
    } catch(e) { return []; }
};

export const allocateRoom = async (roomNo, studentEmail) => {
    try {
        await fetchWithAuth(`/hostel/allocate?room_no=${encodeURIComponent(roomNo)}&student_email=${encodeURIComponent(studentEmail)}`, { method: 'POST' });
    } catch(e) { console.error(e); }
};

export const vacateRoom = async (studentEmail) => {
    try {
        await fetchWithAuth(`/hostel/vacate?student_email=${encodeURIComponent(studentEmail)}`, { method: 'POST' });
    } catch(e) { console.error(e); }
};

// ─── Enrollment ─────────────────────────────────────
export const enrollStudent = async (studentId, classId) => {
    try {
        return await fetchWithAuth('/enroll', {
            method: 'POST',
            body: JSON.stringify({ student_id: studentId, class_id: classId })
        });
    } catch(e) { console.error(e); }
};

export const unenrollStudent = async (studentId, classId) => {
    try {
        await fetchWithAuth('/unenroll', {
            method: 'DELETE',
            body: JSON.stringify({ student_id: studentId, class_id: classId })
        });
    } catch(e) { console.error(e); }
};

export const getStudentEnrollments = async (studentId) => {
    try {
        return await fetchWithAuth(`/enrollments/${studentId}`);
    } catch(e) { return []; }
};