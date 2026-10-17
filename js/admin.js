// Jijamata Public School - Admin Portal Logic
// Powered by Firebase Firestore & Auth

// 1. Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// UI Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const authActions = document.getElementById('authActions');
const userEmailBadge = document.getElementById('userEmailBadge');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const btnLogout = document.getElementById('btnLogout');
const adminToast = document.getElementById('adminToast');
const toastMsg = document.getElementById('toastMsg');

// Toast Helper
function showToast(message, isError = false) {
    toastMsg.textContent = message;
    adminToast.style.borderLeftColor = isError ? 'var(--danger)' : 'var(--gold)';
    adminToast.classList.add('show');
    setTimeout(() => {
        adminToast.classList.remove('show');
    }, 3500);
}

// 2. Auth State Observer
auth.onAuthStateChanged(user => {
    if (user) {
        // Logged in
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        authActions.style.display = 'flex';
        userEmailBadge.textContent = user.email || 'Admin Staff';
        loadAllAdminData();
    } else {
        // Logged out
        loginSection.style.display = 'flex';
        dashboardSection.style.display = 'none';
        authActions.style.display = 'none';
    }
});

// 3. Login Action
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('btnLoginSubmit');
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

    try {
        await auth.signInWithEmailAndPassword(email, password);
        showToast('Welcome to Jijamata Public School Admin Portal!');
    } catch (err) {
        console.error('Login error:', err);
        loginError.style.display = 'block';
        if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
            loginError.textContent = 'Invalid email or password. Please verify your credentials.';
        } else {
            loginError.textContent = err.message || 'Failed to sign in. Please try again.';
        }
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login to Portal';
    }
});

// 4. Logout Action
btnLogout.addEventListener('click', () => {
    auth.signOut().then(() => {
        showToast('Logged out successfully.');
    });
});

// 5. Tab Switching
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPanelId = btn.getAttribute('data-tab');
        const targetPanel = document.getElementById(targetPanelId);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    });
});

// 6. Master Data Loader
function loadAllAdminData() {
    loadTopNotice();
    loadNotices();
    loadFees();
    loadAdmissionDates();
    loadAcademicCalendar();
    loadHostelInfo();
    loadGalleryItems();
}

// ==========================================
// A. NOTICES & TOP NOTICE TICKER
// ==========================================
async function loadTopNotice() {
    try {
        const doc = await db.collection('settings').doc('top_notice').get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('topNoticeInput').value = data.text || '';
            document.getElementById('topNoticeLink').value = data.link || '';
        }
    } catch (e) {
        console.warn('Top notice load note:', e);
    }
}

document.getElementById('btnSaveTopNotice').addEventListener('click', async () => {
    const text = document.getElementById('topNoticeInput').value.trim();
    const link = document.getElementById('topNoticeLink').value.trim();
    const btn = document.getElementById('btnSaveTopNotice');

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        await db.collection('settings').doc('top_notice').set({
            text: text,
            link: link,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('Homepage Top Announcement ticker saved!');
    } catch (e) {
        console.error(e);
        showToast('Error saving top ticker: ' + e.message, true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Save Ticker';
    }
});

function loadNotices() {
    const container = document.getElementById('noticesListContainer');
    db.collection('notices').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        if (snapshot.empty) {
            container.innerHTML = '<p style="font-size: 14px; color: var(--text-muted); padding: 16px; background: var(--bg); border-radius: 8px;">No custom notices posted yet. The public page is currently showing default circulars.</p>';
            return;
        }

        let html = '<table class="admin-table"><thead><tr><th>Category</th><th>Headline</th><th>Date</th><th>Action / Link</th><th>Manage</th></tr></thead><tbody>';
        snapshot.forEach(doc => {
            const n = doc.data();
            html += `
                <tr>
                    <td><span class="badge-category">${escapeHtml(n.category || 'General')}</span></td>
                    <td><strong>${escapeHtml(n.title)}</strong><br><span style="font-size: 12px; color: var(--text-muted);">${escapeHtml(n.description || '')}</span></td>
                    <td style="white-space: nowrap;">${escapeHtml(n.date || '')}</td>
                    <td>${n.link ? `<a href="${escapeHtml(n.link)}" target="_blank" style="color: var(--primary); text-decoration: none; font-size: 13px;"><i class="fas fa-link"></i> ${escapeHtml(n.btnText || 'View')}</a>` : '<span style="color: var(--text-muted); font-size: 12px;">No link</span>'}</td>
                    <td>
                        <button type="button" class="btn-action-delete" onclick="deleteNotice('${doc.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }, err => {
        console.error('Error fetching notices:', err);
        container.innerHTML = `<p style="color: var(--danger); font-size: 13px;">Error loading notices: ${err.message}</p>`;
    });
}

document.getElementById('addNoticeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = document.getElementById('noticeCategory').value;
    const date = document.getElementById('noticeDate').value.trim();
    const title = document.getElementById('noticeTitle').value.trim();
    const description = document.getElementById('noticeDesc').value.trim();
    const btnText = document.getElementById('noticeBtnText').value.trim() || 'View Details';
    const link = document.getElementById('noticeLink').value.trim();

    try {
        await db.collection('notices').add({
            category,
            date,
            title,
            description,
            btnText,
            link,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('addNoticeForm').reset();
        showToast('Circular published successfully!');
    } catch (err) {
        console.error(err);
        showToast('Failed to publish circular: ' + err.message, true);
    }
});

window.deleteNotice = async function(id) {
    if (!confirm('Are you sure you want to remove this notice from the website?')) return;
    try {
        await db.collection('notices').doc(id).delete();
        showToast('Notice removed.');
    } catch (err) {
        showToast('Error deleting notice: ' + err.message, true);
    }
};

// ==========================================
// B. FEE STRUCTURE
// ==========================================
const defaultFeeList = [
    { standard: 'KG (Pre-Primary)', fee: '₹11,000' },
    { standard: '1st Standard', fee: '₹13,500' },
    { standard: '2nd Standard', fee: '₹13,500' },
    { standard: '3rd Standard', fee: '₹14,000' },
    { standard: '4th Standard', fee: '₹14,000' },
    { standard: '5th Standard', fee: '₹15,000' },
    { standard: '6th Standard', fee: '₹15,000' },
    { standard: '7th Standard', fee: '₹16,000' },
    { standard: '8th Standard', fee: '₹17,000' },
    { standard: '9th Standard', fee: '₹18,000' },
    { standard: '10th Standard', fee: '₹20,000' }
];

async function loadFees() {
    const tbody = document.getElementById('feeTableBody');
    try {
        const doc = await db.collection('settings').doc('fee_structure').get();
        let fees = defaultFeeList;
        if (doc.exists && doc.data().list) {
            fees = doc.data().list;
            if (doc.data().note) {
                document.getElementById('feeNoteInput').value = doc.data().note;
            }
        }
        
        let html = '';
        fees.forEach((item, index) => {
            html += `
                <tr>
                    <td><strong>${escapeHtml(item.standard)}</strong></td>
                    <td>
                        <input type="text" class="form-control fee-input" data-index="${index}" data-standard="${escapeHtml(item.standard)}" value="${escapeHtml(item.fee)}" placeholder="e.g. ₹15,000">
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } catch (e) {
        console.error('Fees load error:', e);
    }
}

document.getElementById('btnSaveAllFees').addEventListener('click', async () => {
    const btn = document.getElementById('btnSaveAllFees');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    const inputs = document.querySelectorAll('.fee-input');
    const feeList = [];
    inputs.forEach(input => {
        feeList.push({
            standard: input.getAttribute('data-standard'),
            fee: input.value.trim()
        });
    });

    const note = document.getElementById('feeNoteInput').value.trim();

    try {
        await db.collection('settings').doc('fee_structure').set({
            list: feeList,
            note: note,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('Fee structure updated on admissions page!');
    } catch (e) {
        showToast('Error saving fees: ' + e.message, true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Save Fee Changes';
    }
});

// ==========================================
// C. ADMISSION DATES
// ==========================================
async function loadAdmissionDates() {
    try {
        const doc = await db.collection('settings').doc('admission_dates').get();
        if (doc.exists) {
            const d = doc.data();
            if (d.date1Badge) document.getElementById('date1Badge').value = d.date1Badge;
            if (d.date1Desc) document.getElementById('date1Desc').value = d.date1Desc;
            if (d.date2Badge) document.getElementById('date2Badge').value = d.date2Badge;
            if (d.date2Desc) document.getElementById('date2Desc').value = d.date2Desc;
            if (d.date3Badge) document.getElementById('date3Badge').value = d.date3Badge;
            if (d.date3Desc) document.getElementById('date3Desc').value = d.date3Desc;
            if (d.date4Badge) document.getElementById('date4Badge').value = d.date4Badge;
            if (d.date4Desc) document.getElementById('date4Desc').value = d.date4Desc;
        }
    } catch (e) {
        console.error('Admission dates load error:', e);
    }
}

document.getElementById('btnSaveAdmissionDates').addEventListener('click', async () => {
    const btn = document.getElementById('btnSaveAdmissionDates');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        await db.collection('settings').doc('admission_dates').set({
            date1Badge: document.getElementById('date1Badge').value.trim(),
            date1Desc: document.getElementById('date1Desc').value.trim(),
            date2Badge: document.getElementById('date2Badge').value.trim(),
            date2Desc: document.getElementById('date2Desc').value.trim(),
            date3Badge: document.getElementById('date3Badge').value.trim(),
            date3Desc: document.getElementById('date3Desc').value.trim(),
            date4Badge: document.getElementById('date4Badge').value.trim(),
            date4Desc: document.getElementById('date4Desc').value.trim(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('Admission dates saved!');
    } catch (e) {
        showToast('Error saving dates: ' + e.message, true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Save Dates';
    }
});

// ==========================================
// D. ACADEMIC CALENDAR
// ==========================================
function loadAcademicCalendar() {
    const container = document.getElementById('calendarListContainer');
    db.collection('academic_calendar').orderBy('createdAt', 'asc').onSnapshot(snapshot => {
        if (snapshot.empty) {
            container.innerHTML = '<p style="font-size: 14px; color: var(--text-muted); padding: 16px; background: var(--bg); border-radius: 8px;">No custom calendar events added yet. Public page shows default academic calendar.</p>';
            return;
        }

        let html = '<table class="admin-table"><thead><tr><th>Event</th><th>Date / Duration</th><th>Description</th><th>Manage</th></tr></thead><tbody>';
        snapshot.forEach(doc => {
            const c = doc.data();
            html += `
                <tr>
                    <td><strong>${escapeHtml(c.name)}</strong></td>
                    <td>${escapeHtml(c.date)}</td>
                    <td>${escapeHtml(c.desc || '')}</td>
                    <td>
                        <button type="button" class="btn-action-delete" onclick="deleteCalendarEvent('${doc.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    });
}

document.getElementById('addCalendarForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('calEventName').value.trim();
    const date = document.getElementById('calEventDate').value.trim();
    const desc = document.getElementById('calEventDesc').value.trim();

    try {
        await db.collection('academic_calendar').add({
            name,
            date,
            desc,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('addCalendarForm').reset();
        showToast('Calendar event added!');
    } catch (err) {
        showToast('Error: ' + err.message, true);
    }
});

window.deleteCalendarEvent = async function(id) {
    if (!confirm('Remove this event from academic calendar?')) return;
    try {
        await db.collection('academic_calendar').doc(id).delete();
        showToast('Calendar event removed.');
    } catch (e) {
        showToast('Error: ' + e.message, true);
    }
};

// ==========================================
// E. HOSTEL INFO
// ==========================================
async function loadHostelInfo() {
    try {
        const doc = await db.collection('settings').doc('hostel_info').get();
        if (doc.exists) {
            const data = doc.data();
            if (data.note) document.getElementById('hostelNoteInput').value = data.note;
            if (data.phone) document.getElementById('hostelPhoneInput').value = data.phone;
            if (data.email) document.getElementById('hostelEmailInput').value = data.email;
        }
    } catch (e) {
        console.error('Hostel info load error:', e);
    }

    // Load Routine Table
    await loadHostelRoutine();
}

// Default routine items for initial pre-population if Firestore is empty
const defaultHostelRoutine = [
    { time: "06:00 AM – 06:30 AM", activity: "Morning Wake Up & Exercise", details: "Physical fitness, yoga, and fresh air exercises" },
    { time: "06:30 AM – 07:30 AM", activity: "Personal Hygiene & Cleanliness", details: "Bathing, uniform preparation, and room tidying" },
    { time: "07:30 AM – 08:15 AM", activity: "Healthy Breakfast", details: "Nutritious breakfast served in dining hall" },
    { time: "08:30 AM – 02:30 PM", activity: "School Hours", details: "Attending regular school classes and activities" },
    { time: "02:30 PM – 03:30 PM", activity: "Lunch & Rest", details: "Balanced lunch followed by short rest period" },
    { time: "03:30 PM – 05:00 PM", activity: "Supervised Evening Study", details: "Guided homework completion and teacher assistance" },
    { time: "05:00 PM – 06:30 PM", activity: "Sports & Recreation", details: "Outdoor playground games and indoor activities" },
    { time: "06:30 PM – 07:30 PM", activity: "Evening Snacks & Free Time", details: "Snacks, relaxation, and wash up" },
    { time: "07:30 PM – 09:00 PM", activity: "Night Study Session", details: "Quiet self-study and revision time" },
    { time: "09:00 PM – 09:45 PM", activity: "Dinner", details: "Hot vegetarian dinner served in mess hall" },
    { time: "10:00 PM", activity: "Lights Out", details: "Night roll call and rest time" }
];

function createRoutineRowHtml(item = { time: '', activity: '', details: '' }) {
    return `
        <tr>
            <td style="padding: 8px 10px;">
                <input type="text" class="form-control routine-time" value="${escapeHtml(item.time)}" placeholder="e.g. 06:00 AM – 06:30 AM" style="margin: 0; padding: 8px 10px; font-size: 13px;" required>
            </td>
            <td style="padding: 8px 10px;">
                <input type="text" class="form-control routine-activity" value="${escapeHtml(item.activity)}" placeholder="e.g. Morning Wake Up" style="margin: 0; padding: 8px 10px; font-size: 13px;" required>
            </td>
            <td style="padding: 8px 10px;">
                <input type="text" class="form-control routine-details" value="${escapeHtml(item.details)}" placeholder="e.g. Physical fitness and yoga" style="margin: 0; padding: 8px 10px; font-size: 13px;">
            </td>
            <td style="padding: 8px 10px; text-align: center;">
                <button type="button" class="btn-action-delete" style="padding: 6px 10px; font-size: 12px; margin: 0 auto;" onclick="removeRoutineRow(this)" title="Remove this slot">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
}

window.removeRoutineRow = function(btn) {
    const row = btn.closest('tr');
    if (row) row.remove();
};

async function loadHostelRoutine() {
    const container = document.getElementById('routineRowsContainer');
    if (!container) return;

    try {
        const doc = await db.collection('settings').doc('hostel_routine').get();
        let items = defaultHostelRoutine;
        if (doc.exists && doc.data().items && doc.data().items.length > 0) {
            items = doc.data().items;
        }
        container.innerHTML = items.map(item => createRoutineRowHtml(item)).join('');
    } catch (e) {
        console.error('Routine load error:', e);
        container.innerHTML = defaultHostelRoutine.map(item => createRoutineRowHtml(item)).join('');
    }
}

const btnAddRoutineRow = document.getElementById('btnAddRoutineRow');
if (btnAddRoutineRow) {
    btnAddRoutineRow.addEventListener('click', () => {
        const container = document.getElementById('routineRowsContainer');
        if (container) {
            container.insertAdjacentHTML('beforeend', createRoutineRowHtml());
            const newRow = container.lastElementChild;
            const timeInput = newRow ? newRow.querySelector('.routine-time') : null;
            if (timeInput) timeInput.focus();
        }
    });
}

const btnSaveRoutine = document.getElementById('btnSaveRoutine');
if (btnSaveRoutine) {
    btnSaveRoutine.addEventListener('click', async () => {
        const rows = document.querySelectorAll('#routineRowsContainer tr');
        const items = [];
        rows.forEach(r => {
            const time = (r.querySelector('.routine-time') || {}).value || '';
            const activity = (r.querySelector('.routine-activity') || {}).value || '';
            const details = (r.querySelector('.routine-details') || {}).value || '';
            if (time.trim() || activity.trim()) {
                items.push({
                    time: time.trim(),
                    activity: activity.trim(),
                    details: details.trim()
                });
            }
        });

        if (items.length === 0) {
            showToast('Please add at least one routine time slot.', true);
            return;
        }

        btnSaveRoutine.disabled = true;
        btnSaveRoutine.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving Routine...';

        try {
            await db.collection('settings').doc('hostel_routine').set({
                items: items,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showToast('Hostel Daily Routine saved successfully!');
        } catch (e) {
            showToast('Error saving routine: ' + e.message, true);
        } finally {
            btnSaveRoutine.disabled = false;
            btnSaveRoutine.innerHTML = '<i class="fas fa-save"></i> Save Daily Routine';
        }
    });
}

document.getElementById('btnSaveHostel').addEventListener('click', async () => {
    const btn = document.getElementById('btnSaveHostel');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        await db.collection('settings').doc('hostel_info').set({
            note: document.getElementById('hostelNoteInput').value.trim(),
            phone: document.getElementById('hostelPhoneInput').value.trim(),
            email: document.getElementById('hostelEmailInput').value.trim(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('Hostel contacts & note updated!');
    } catch (e) {
        showToast('Error saving hostel info: ' + e.message, true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Save Contacts & Note';
    }
});

// ==========================================
// F. EVENT PHOTO GALLERY
// ==========================================
function loadGalleryItems() {
    const container = document.getElementById('galleryListContainer');
    db.collection('gallery_items').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        if (snapshot.empty) {
            container.innerHTML = '<p style="font-size: 14px; color: var(--text-muted); padding: 16px; background: var(--bg); border-radius: 8px;">No custom photos added yet. All existing school photos remain active.</p>';
            return;
        }

        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px;">';
        snapshot.forEach(doc => {
            const g = doc.data();
            html += `
                <div style="background: var(--bg); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; padding: 10px;">
                    <img src="${escapeHtml(g.url)}" alt="${escapeHtml(g.caption)}" style="width: 100%; height: 130px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;" onerror="this.src='images/logo.png'">
                    <span class="badge-category" style="margin-bottom: 6px;">${escapeHtml(g.category)}</span>
                    <p style="font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px;">${escapeHtml(g.caption)}</p>
                    <button type="button" class="btn-action-delete" style="width: 100%;" onclick="deleteGalleryItem('${doc.id}')">
                        <i class="fas fa-trash"></i> Remove Photo
                    </button>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    });
}

// Photo Upload & Preview Logic
let currentPhotoData = null;
const photoFileInput = document.getElementById('photoFileInput');
const photoPreviewWrap = document.getElementById('photoPreviewWrap');
const photoPreviewImg = document.getElementById('photoPreviewImg');
const photoPreviewName = document.getElementById('photoPreviewName');
const photoPreviewSize = document.getElementById('photoPreviewSize');
const btnRemoveSelectedPhoto = document.getElementById('btnRemoveSelectedPhoto');
const photoUrlInput = document.getElementById('photoUrl');

if (photoFileInput) {
    photoFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Auto-compress and scale image on client-side
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 1200;

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Export to high-quality compressed JPEG
                currentPhotoData = canvas.toDataURL('image/jpeg', 0.82);

                // Show preview
                photoPreviewImg.src = currentPhotoData;
                photoPreviewName.textContent = file.name;
                const sizeKb = Math.round((currentPhotoData.length * 3 / 4) / 1024);
                photoPreviewSize.textContent = `Optimized size: ~${sizeKb} KB`;
                photoPreviewWrap.style.display = 'flex';
                photoUrlInput.value = '';
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

if (btnRemoveSelectedPhoto) {
    btnRemoveSelectedPhoto.addEventListener('click', function() {
        currentPhotoData = null;
        if (photoFileInput) photoFileInput.value = '';
        if (photoPreviewWrap) photoPreviewWrap.style.display = 'none';
    });
}

if (photoUrlInput) {
    photoUrlInput.addEventListener('input', function() {
        if (this.value.trim().length > 0) {
            currentPhotoData = null;
            if (photoFileInput) photoFileInput.value = '';
            if (photoPreviewWrap) photoPreviewWrap.style.display = 'none';
        }
    });
}

document.getElementById('addPhotoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = document.getElementById('photoCategory').value;
    const caption = document.getElementById('photoCaption').value.trim();
    const finalUrl = currentPhotoData || document.getElementById('photoUrl').value.trim();
    const btn = document.getElementById('btnAddPhotoSubmit');

    if (!finalUrl) {
        showToast('Please select a photo from your device or enter an image URL.', true);
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading & Saving...';

    try {
        await db.collection('gallery_items').add({
            category,
            caption,
            url: finalUrl,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('addPhotoForm').reset();
        currentPhotoData = null;
        if (photoPreviewWrap) photoPreviewWrap.style.display = 'none';
        showToast('Photo uploaded and added to school gallery!');
    } catch (e) {
        console.error(e);
        showToast('Error adding photo: ' + e.message, true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-plus"></i> Upload & Add Photo to Gallery';
    }
});

window.deleteGalleryItem = async function(id) {
    if (!confirm('Remove this photo from the gallery?')) return;
    try {
        await db.collection('gallery_items').doc(id).delete();
        showToast('Photo removed.');
    } catch (e) {
        showToast('Error: ' + e.message, true);
    }
};

// Utilities
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
