/**
 * Jijamata Public School - Dynamic Public Content Sync
 * Connects the public website pages to Firebase Firestore.
 * Seamlessly falls back to default static HTML if offline or empty.
 */

(function () {
    if (typeof firebase === 'undefined' || typeof firebaseConfig === 'undefined') {
        return;
    }

    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
    } catch (e) {
        console.warn('Firebase init note:', e);
        return;
    }

    const db = firebase.firestore();

    // 1. Top Notice Announcement Ticker (All pages, especially index.html)
    function syncTopNotice() {
        const fullNoticeEl = document.querySelector('.notice-text-full');
        const shortNoticeEl = document.querySelector('.notice-text-short');
        const noticeLinkEl = document.querySelector('.notice-link');

        if (!fullNoticeEl && !shortNoticeEl) return;

        db.collection('settings').doc('top_notice').get().then(doc => {
            if (doc.exists && doc.data().text) {
                const text = doc.data().text;
                const link = doc.data().link;
                if (fullNoticeEl) fullNoticeEl.textContent = text;
                if (shortNoticeEl) shortNoticeEl.textContent = text;
                if (link && noticeLinkEl) {
                    noticeLinkEl.href = link;
                }
            }
        }).catch(err => console.debug('Top notice fallback active'));
    }

    // 2. Latest Notices (notices.html)
    function syncNoticesPage() {
        // Find container of notices
        const noticesContainer = document.getElementById('noticesDisplayContainer') || 
            document.querySelector('.hostel-section .section-container > div[style*="flex-direction: column"]');
        
        if (!noticesContainer) return;

        db.collection('notices').orderBy('createdAt', 'desc').get().then(snapshot => {
            if (snapshot.empty) return; // Keep static default notices

            let html = '';
            snapshot.forEach(doc => {
                const n = doc.data();
                const isGold = (n.category === 'Admissions' || n.category === 'Parent Meeting');
                const borderColor = isGold ? 'var(--gold)' : 'var(--accent-dark)';
                const badgeBg = isGold ? 'var(--gold)' : 'var(--bg-alt)';
                const badgeColor = isGold ? 'var(--bg)' : 'var(--accent-dark)';
                const btnClass = isGold ? 'btn btn-primary' : 'btn btn-secondary';
                const actionBtn = n.link 
                    ? `<a href="${escapeHtml(n.link)}" class="${btnClass}" style="padding: 8px 20px; font-size: 13px;">${escapeHtml(n.btnText || 'View Details')}</a>`
                    : `<span style="font-size: 13px; color: var(--text-muted); font-weight: 500;"><i class="fas fa-calendar-alt"></i> ${escapeHtml(n.date || 'Check Notice')}</span>`;

                html += `
                    <div style="background-color: var(--bg); border-left: 5px solid ${borderColor}; padding: 25px; border-radius: 10px; box-shadow: var(--shadow); display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 15px;">
                        <div>
                            <span style="display: inline-block; background-color: ${badgeBg}; color: ${badgeColor}; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-bottom: 8px;">${escapeHtml(n.category || 'Notice')} • ${escapeHtml(n.date || '')}</span>
                            <h3 style="font-size: 18px; color: var(--accent-dark); margin-bottom: 5px;">📢 ${escapeHtml(n.title)}</h3>
                            <p style="font-size: 14px; color: var(--text-muted);">${escapeHtml(n.description || '')}</p>
                        </div>
                        ${actionBtn}
                    </div>
                `;
            });

            noticesContainer.innerHTML = html;
        }).catch(err => console.debug('Notices page fallback active'));
    }

    // 3. Admissions Page (Fee Structure & Important Dates)
    function syncAdmissionsPage() {
        const feeTableBody = document.querySelector('.fee-table tbody');
        const feeNoteEl = document.querySelector('.fee-note');
        const datesGrid = document.querySelector('.dates-grid');

        // Sync Fee Structure
        if (feeTableBody) {
            db.collection('settings').doc('fee_structure').get().then(doc => {
                if (doc.exists && doc.data().list && doc.data().list.length > 0) {
                    let html = '';
                    doc.data().list.forEach(item => {
                        html += `<tr><td>${escapeHtml(item.standard)}</td><td>${escapeHtml(item.fee)}</td></tr>`;
                    });
                    feeTableBody.innerHTML = html;
                    if (doc.data().note && feeNoteEl) {
                        feeNoteEl.innerHTML = `<strong>Note:</strong> ${escapeHtml(doc.data().note)}`;
                    }
                }
            }).catch(err => console.debug('Fees fallback active'));
        }

        // Sync Admission Dates
        if (datesGrid) {
            db.collection('settings').doc('admission_dates').get().then(doc => {
                if (doc.exists) {
                    const d = doc.data();
                    const cards = datesGrid.querySelectorAll('.date-card');
                    if (cards.length >= 4) {
                        if (d.date1Badge) applyDateCard(cards[0], d.date1Badge, d.date1Desc);
                        if (d.date2Badge) applyDateCard(cards[1], d.date2Badge, d.date2Desc);
                        if (d.date3Badge) applyDateCard(cards[2], d.date3Badge, d.date3Desc);
                        if (d.date4Badge) applyDateCard(cards[3], d.date4Badge, d.date4Desc);
                    }
                }
            }).catch(err => console.debug('Dates fallback active'));
        }
    }

    function applyDateCard(cardEl, badgeText, descText) {
        if (!cardEl) return;
        const parts = badgeText.trim().split(' ');
        const dayEl = cardEl.querySelector('.date-day');
        const monthEl = cardEl.querySelector('.date-month');
        const descEl = cardEl.querySelector('.date-info p');

        if (dayEl && parts[0]) dayEl.textContent = parts[0];
        if (monthEl && parts[1]) monthEl.textContent = parts[1];
        if (descEl && descText) descEl.textContent = descText;
    }

    // 4. Academic Calendar (academics.html)
    function syncAcademicCalendar() {
        const calTableBody = document.querySelector('.calendar-table tbody');
        if (!calTableBody) return;

        db.collection('academic_calendar').orderBy('createdAt', 'asc').get().then(snapshot => {
            if (snapshot.empty) return;

            let html = '';
            snapshot.forEach(doc => {
                const c = doc.data();
                html += `
                    <tr>
                        <td>${escapeHtml(c.name)}</td>
                        <td>${escapeHtml(c.date)}</td>
                        <td>${escapeHtml(c.desc || '')}</td>
                    </tr>
                `;
            });
            calTableBody.innerHTML = html;
        }).catch(err => console.debug('Calendar fallback active'));
    }

    // 5. Hostel Page (hostel.html)
    function syncHostelPage() {
        // Sync Routine Table
        const routineTableBody = document.querySelector('.routine-table tbody');
        if (routineTableBody) {
            db.collection('settings').doc('hostel_routine').get().then(doc => {
                if (doc.exists && doc.data().items && doc.data().items.length > 0) {
                    let html = '';
                    doc.data().items.forEach(item => {
                        html += `
                            <tr>
                                <td><strong>${escapeHtml(item.time)}</strong></td>
                                <td>${escapeHtml(item.activity)}</td>
                                <td>${escapeHtml(item.details || '')}</td>
                            </tr>
                        `;
                    });
                    routineTableBody.innerHTML = html;
                }
            }).catch(err => console.debug('Hostel routine fallback active'));
        }

        // Sync Contact Note & Numbers
        const hostelNoteBox = document.querySelector('.hostel-section .section-container > div > div:nth-child(2)');
        if (hostelNoteBox) {
            db.collection('settings').doc('hostel_info').get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    const noteP = hostelNoteBox.querySelector('p');
                    const phoneSpan = hostelNoteBox.querySelector('span a[href^="tel"]');
                    const emailSpan = hostelNoteBox.querySelector('span a[href^="mailto"]');

                    if (data.note && noteP) noteP.textContent = data.note;
                    if (data.phone && phoneSpan) {
                        phoneSpan.parentElement.innerHTML = `<a href="tel:${escapeHtml(data.phone)}" style="color: inherit; text-decoration: none;">${escapeHtml(data.phone)}</a>`;
                    }
                    if (data.email && emailSpan) {
                        emailSpan.parentElement.innerHTML = `<a href="mailto:${escapeHtml(data.email)}" style="color: inherit; text-decoration: none;">${escapeHtml(data.email)}</a>`;
                    }
                }
            }).catch(err => console.debug('Hostel fallback active'));
        }
    }

    // 6. Photo Gallery (gallery.html)
    function syncGalleryPage() {
        if (typeof galleryData === 'undefined') return;

        db.collection('gallery_items').orderBy('createdAt', 'desc').get().then(snapshot => {
            if (snapshot.empty) return;

            const dynamicItems = [];
            snapshot.forEach((doc, idx) => {
                const g = doc.data();
                dynamicItems.push({
                    id: 'custom_' + doc.id,
                    src: g.url,
                    category: g.category || 'School Events',
                    alt: g.caption || 'Jijamata Public School Event'
                });
            });

            // Prepend dynamic items to existing galleryData
            galleryData.unshift(...dynamicItems);

            // Dispatch update event to re-render gallery
            window.dispatchEvent(new CustomEvent('galleryDataUpdated'));
            if (typeof renderGallery === 'function') {
                renderGallery();
            } else if (typeof initGallery === 'function') {
                initGallery();
            }
        }).catch(err => console.debug('Gallery fallback active'));
    }

    // Escape helper
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Run synchronization once DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runSync);
    } else {
        runSync();
    }

    function runSync() {
        syncTopNotice();
        syncNoticesPage();
        syncAdmissionsPage();
        syncAcademicCalendar();
        syncHostelPage();
        syncGalleryPage();
    }
})();
