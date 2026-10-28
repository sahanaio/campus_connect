/**
 * CampusConnect - Application Controller
 * Department of Computer Science & Engineering (AIML), REVA University
 * 
 * Handles DOM interactions, state synchronization, dynamic card rendering,
 * eligibility rule evaluations, TF-IDF recommendation views, and notifications.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Application State
  const state = {
    currentUser: null,
    opportunities: [],
    activeTab: 'all',
    activeCategory: 'all',
    searchQuery: '',
    notifications: [],
    unreadNotifCount: 0
  };

  // DOM Elements
  const els = {
    personaSelect: document.getElementById('persona-select'),
    navUserName: document.getElementById('nav-user-name'),
    navUserRole: document.getElementById('nav-user-role'),
    navUserAvatar: document.getElementById('nav-user-avatar'),
    heroStudentMeta: document.getElementById('hero-student-meta'),
    
    // KPI Counters
    kpiTotal: document.getElementById('kpi-total'),
    kpiEligible: document.getElementById('kpi-eligible'),
    kpiTopMatch: document.getElementById('kpi-top-match'),
    kpiDeadlines: document.getElementById('kpi-deadlines'),
    savedCount: document.getElementById('saved-count'),
    appliedCount: document.getElementById('applied-count'),
    
    // Auth Trigger & Modal
    authModalBtn: document.getElementById('auth-modal-btn'),
    authModal: document.getElementById('auth-modal'),
    closeAuthModal: document.getElementById('close-auth-modal'),
    authTabLogin: document.getElementById('auth-tab-login'),
    authTabSignup: document.getElementById('auth-tab-signup'),
    loginForm: document.getElementById('login-form'),
    signupForm: document.getElementById('signup-form'),

    // Opportunity Details Modal
    detailModal: document.getElementById('detail-modal'),
    closeDetailModal: document.getElementById('close-detail-modal'),
    detailTypeBadge: document.getElementById('detail-type-badge'),
    detailTitle: document.getElementById('detail-title'),
    detailOrganizer: document.getElementById('detail-organizer'),
    detailStipend: document.getElementById('detail-stipend'),
    detailLocation: document.getElementById('detail-location'),
    detailDuration: document.getElementById('detail-duration'),
    detailDeadline: document.getElementById('detail-deadline'),
    detailEligibilityBanner: document.getElementById('detail-eligibility-banner'),
    detailEligibilityText: document.getElementById('detail-eligibility-text'),
    detailAiMatchPill: document.getElementById('detail-aimatch-pill'),
    detailDesc: document.getElementById('detail-desc'),
    detailTagsRow: document.getElementById('detail-tags-row'),
    detailRulesGrid: document.getElementById('detail-rules-grid'),
    detailBookmarkBtn: document.getElementById('detail-bookmark-btn'),
    detailApplyActionBtn: document.getElementById('detail-apply-action-btn'),
    detailExternalLink: document.getElementById('detail-external-link'),
    
    // Navigation & Filters
    mainNav: document.getElementById('main-nav'),
    categoryPills: document.getElementById('category-pills'),
    searchInput: document.getElementById('search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    resultCounter: document.getElementById('result-counter'),
    
    // View Headers
    viewTitle: document.getElementById('view-title'),
    viewDesc: document.getElementById('view-desc'),
    showTfidfInfoBtn: document.getElementById('show-tfidf-info-btn'),
    adminCreateTriggerBtn: document.getElementById('admin-create-trigger-btn'),
    adminNavItem: document.getElementById('admin-nav-item'),
    
    // Containers
    oppsGrid: document.getElementById('opportunities-grid'),
    emptyState: document.getElementById('empty-state'),
    emptyStateMsg: document.getElementById('empty-state-msg'),
    resetFilterBtn: document.getElementById('reset-filter-btn'),
    toastContainer: document.getElementById('toast-container'),
    
    // Modals
    eligibilityModal: document.getElementById('eligibility-modal'),
    closeEligibilityModal: document.getElementById('close-eligibility-modal'),
    modalOppTitle: document.getElementById('modal-opp-title'),
    modalOppOrg: document.getElementById('modal-opp-organizer'),
    modalStudentName: document.getElementById('modal-student-name'),
    modalScoreCircle: document.getElementById('modal-score-circle'),
    modalScoreStatus: document.getElementById('modal-score-status'),
    modalRulesList: document.getElementById('modal-rules-list'),
    modalRawRulesGrid: document.getElementById('modal-raw-rules-grid'),
    modalSaveBtn: document.getElementById('modal-save-btn'),
    modalApplyBtn: document.getElementById('modal-apply-btn'),
    
    // TF-IDF Modal
    tfidfModal: document.getElementById('tfidf-modal'),
    closeTfidfModal: document.getElementById('close-tfidf-modal'),
    closeTfidfBtn: document.getElementById('close-tfidf-btn'),
    tfidfStudentTags: document.getElementById('tfidf-student-tags'),
    tfidfRankingTable: document.getElementById('tfidf-ranking-table').querySelector('tbody'),
    
    // Notification Drawer
    notifBellBtn: document.getElementById('notif-bell-btn'),
    notifBadge: document.getElementById('notif-badge'),
    notifDrawer: document.getElementById('notif-drawer'),
    notifDrawerBackdrop: document.getElementById('notif-drawer-backdrop'),
    closeDrawerBtn: document.getElementById('close-drawer-btn'),
    drawerUnreadCount: document.getElementById('drawer-unread-count'),
    drawerNotifsList: document.getElementById('drawer-notifs-list'),
    markAllReadBtn: document.getElementById('mark-all-read-btn'),
    triggerScanBtnDrawer: document.getElementById('trigger-scan-btn-drawer'),
    triggerSchedulerBtn: document.getElementById('trigger-scheduler-btn'),
    
    // Profile Modal
    profileEditBtn: document.getElementById('profile-edit-btn'),
    profileModal: document.getElementById('profile-modal'),
    closeProfileModal: document.getElementById('close-profile-modal'),
    cancelProfileBtn: document.getElementById('cancel-profile-btn'),
    profileForm: document.getElementById('profile-form'),
    profName: document.getElementById('prof-name'),
    profBranch: document.getElementById('prof-branch'),
    profSem: document.getElementById('prof-sem'),
    profCgpa: document.getElementById('prof-cgpa'),
    profBacklogs: document.getElementById('prof-backlogs'),
    profSkills: document.getElementById('prof-skills'),
    profInterests: document.getElementById('prof-interests'),
    
    // Admin Modal
    adminModal: document.getElementById('admin-modal'),
    closeAdminModal: document.getElementById('close-admin-modal'),
    cancelAdminBtn: document.getElementById('cancel-admin-btn'),
    adminCreateForm: document.getElementById('admin-create-form'),
    oppDeadlineInput: document.getElementById('opp-deadline')
  };

  // Set default deadline date to 7 days ahead for admin form
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);
  if (els.oppDeadlineInput) {
    els.oppDeadlineInput.value = defaultDate.toISOString().split('T')[0];
  }

  // Toast Notification helper
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : type === 'danger' ? 'toast-danger' : ''}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✅' : type === 'danger' ? '⚠️' : '🔔'}</span>
      <div class="toast-text">${message}</div>
    `;
    els.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Days left helper
  function getDaysLeft(dateStr) {
    const now = new Date();
    now.setHours(0,0,0,0);
    const target = new Date(dateStr);
    target.setHours(0,0,0,0);
    const diff = Math.round((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  }

  // 1. Initial State Load
  async function initApp() {
    await window.apiService.checkServerHealth();
    state.currentUser = await window.apiService.getProfile();
    
    // Set persona selector dropdown to match active user
    if (els.personaSelect) {
      els.personaSelect.value = state.currentUser.id;
    }

    updateUserUI();
    await loadNotifications();
    await refreshData();
  }

  // Update User Profile visuals across the UI
  function updateUserUI() {
    const user = state.currentUser;
    els.navUserName.textContent = user.full_name;
    els.navUserAvatar.src = user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
    
    if (user.role === 'admin') {
      els.navUserRole.textContent = 'Faculty Coordinator';
      els.heroStudentMeta.textContent = `${user.full_name} • Faculty Admin • Dept of CSE (AIML)`;
      els.adminNavItem.classList.remove('hidden');
    } else {
      els.navUserRole.textContent = `${user.branch} • Sem ${user.semester}`;
      els.heroStudentMeta.textContent = `${user.full_name} • ${user.branch} Sem ${user.semester} • ${user.cgpa} CGPA • ${user.backlogs} Backlogs`;
    }
  }

  // Load and refresh notifications
  async function loadNotifications() {
    const data = await window.apiService.getNotifications();
    state.notifications = data.notifications || [];
    state.unreadNotifCount = data.unreadCount || 0;

    if (state.unreadNotifCount > 0) {
      els.notifBadge.textContent = state.unreadNotifCount;
      els.notifBadge.classList.remove('hidden');
    } else {
      els.notifBadge.classList.add('hidden');
    }

    els.drawerUnreadCount.textContent = `${state.unreadNotifCount} unread`;
    renderDrawerNotifications();
  }

  function renderDrawerNotifications() {
    if (state.notifications.length === 0) {
      els.drawerNotifsList.innerHTML = `
        <div class="empty-state">
          <p>No new notifications at this time.</p>
        </div>
      `;
      return;
    }

    els.drawerNotifsList.innerHTML = state.notifications.map(n => `
      <div class="notif-card ${n.is_read ? '' : 'unread'}" data-notif-id="${n.id}">
        <div class="notif-top">
          <span class="notif-title">${n.title}</span>
          <span class="notif-time">${new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="notif-msg">${n.message}</div>
      </div>
    `).join('');

    // Attach click handler to mark as read
    els.drawerNotifsList.querySelectorAll('.notif-card').forEach(card => {
      card.addEventListener('click', async () => {
        const id = card.dataset.notifId;
        await window.apiService.markNotificationRead(id);
        await loadNotifications();
      });
    });
  }

  // 2. Fetch and Refresh Opportunities
  async function refreshData() {
    els.oppsGrid.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Evaluating eligibility criteria & running AI recommendation ranking...</p>
      </div>
    `;

    // Fetch according to active tab
    let items = [];
    if (state.activeTab === 'all') {
      items = await window.apiService.getOpportunities(state.activeCategory, state.searchQuery);
    } else if (state.activeTab === 'recommended') {
      items = await window.apiService.getRecommendations();
      // Apply category and search filters client side if in rec view
      if (state.activeCategory !== 'all') {
        items = items.filter(o => o.type.toLowerCase() === state.activeCategory.toLowerCase());
      }
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        items = items.filter(o => o.title.toLowerCase().includes(q) || o.organizer.toLowerCase().includes(q));
      }
    } else if (state.activeTab === 'eligible') {
      items = await window.apiService.getEligibleOpportunities();
      if (state.activeCategory !== 'all') {
        items = items.filter(o => o.type.toLowerCase() === state.activeCategory.toLowerCase());
      }
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        items = items.filter(o => o.title.toLowerCase().includes(q) || o.organizer.toLowerCase().includes(q));
      }
    } else if (state.activeTab === 'saved') {
      items = await window.apiService.getSavedOpportunities();
      if (state.activeCategory !== 'all') {
        items = items.filter(o => o.type.toLowerCase() === state.activeCategory.toLowerCase());
      }
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        items = items.filter(o => o.title.toLowerCase().includes(q) || o.organizer.toLowerCase().includes(q));
      }
    } else if (state.activeTab === 'applied') {
      items = await window.apiService.getAppliedOpportunities();
      if (state.activeCategory !== 'all') {
        items = items.filter(o => o.type.toLowerCase() === state.activeCategory.toLowerCase());
      }
      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        items = items.filter(o => o.title.toLowerCase().includes(q) || o.organizer.toLowerCase().includes(q));
      }
    } else if (state.activeTab === 'admin') {
      items = await window.apiService.getOpportunities(state.activeCategory, state.searchQuery);
    }

    state.opportunities = items;
    updateKpis();
    renderCards(items);
  }

  // Update KPI counters
  async function updateKpis() {
    const all = await window.apiService.getOpportunities('all');
    const eligible = all.filter(o => o.eligibility && o.eligibility.isEligible);
    const saved = await window.apiService.getSavedOpportunities();
    const applied = await window.apiService.getAppliedOpportunities();
    const urgent = all.filter(o => {
      const days = getDaysLeft(o.deadline);
      return days >= 0 && days <= 3;
    });

    els.kpiTotal.textContent = all.length;
    els.kpiEligible.textContent = eligible.length;
    els.kpiDeadlines.textContent = urgent.length;
    els.savedCount.textContent = saved.length;
    if (els.appliedCount) els.appliedCount.textContent = applied.length;

    // Calculate top match percentage for active user
    if (state.currentUser.role !== 'admin') {
      const recs = await window.apiService.getRecommendations();
      if (recs.length > 0) {
        els.kpiTopMatch.textContent = `${recs[0].matchPercentage || 92}%`;
      }
    } else {
      els.kpiTopMatch.textContent = 'Admin Mode';
    }
  }

  // 3. Render Opportunity Cards
  function renderCards(cards) {
    if (!cards || cards.length === 0) {
      els.oppsGrid.classList.add('hidden');
      els.emptyState.classList.remove('hidden');
      els.resultCounter.textContent = '0 opportunities found';
      return;
    }

    els.oppsGrid.classList.remove('hidden');
    els.emptyState.classList.add('hidden');
    els.resultCounter.textContent = `Showing ${cards.length} opportunit${cards.length === 1 ? 'y' : 'ies'}`;

    els.oppsGrid.innerHTML = cards.map(opp => {
      const daysLeft = getDaysLeft(opp.deadline);
      let deadlineClass = 'deadline-badge';
      let deadlineText = `📅 Due in ${daysLeft} days`;

      if (daysLeft < 0) {
        deadlineText = '⚠️ Expired';
        deadlineClass += ' deadline-urgent';
      } else if (daysLeft === 0) {
        deadlineText = '🔥 Deadline Today!';
        deadlineClass += ' deadline-urgent';
      } else if (daysLeft === 1) {
        deadlineText = '🔥 1 Day Remaining!';
        deadlineClass += ' deadline-urgent';
      } else if (daysLeft <= 3) {
        deadlineText = `⏳ ${daysLeft} Days Left`;
        deadlineClass += ' deadline-soon';
      }

      const eligibility = opp.eligibility || { isEligible: true, score: 100, passedRules: [], failedRules: [] };
      const isEligible = eligibility.isEligible;
      const isAdmin = state.currentUser.role === 'admin';

      return `
        <article class="opp-card" data-id="${opp.id}" data-type="${opp.type}">
          <!-- Header: Category & Deadline -->
          <div>
            <div class="opp-card-header">
              <span class="type-badge type-${opp.type}">
                ${getTypeIcon(opp.type)} ${formatType(opp.type)}
              </span>
              <div class="card-header-actions">
                <span class="${deadlineClass}">${deadlineText}</span>
                <button class="bookmark-btn ${opp.isSaved ? 'active' : ''}" data-action="save" data-id="${opp.id}" title="Bookmark Opportunity">
                  ${opp.isSaved ? '★' : '☆'}
                </button>
              </div>
            </div>

            <div class="opp-card-body" style="margin-top: 0.85rem;">
              <h3 class="opp-title">${opp.title}</h3>
              <div class="opp-organizer">🏛️ ${opp.organizer}</div>

              <div class="opp-details-grid">
                <div class="detail-item">
                  <span class="detail-label">Stipend / Prize</span>
                  <span class="detail-value">${opp.stipend || 'Specified in link'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Location</span>
                  <span class="detail-value">${opp.location || 'REVA Campus'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Duration</span>
                  <span class="detail-value">${opp.duration || 'Semester'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Deadline</span>
                  <span class="detail-value">${opp.deadline}</span>
                </div>
              </div>

              <p class="opp-description">${opp.description}</p>

              <!-- Tags -->
              <div class="tags-row">
                ${(opp.tags || []).map(tag => {
                  const isHighlighted = (opp.matchedKeywords || []).includes(tag.toLowerCase());
                  return `<span class="tag-chip ${isHighlighted ? 'tag-highlight' : ''}">${tag}</span>`;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Footer Area: Eligibility Status & Action Buttons -->
          <div>
            <!-- Eligibility / AI Match Banner -->
            <div class="card-match-banner ${isEligible ? 'status-eligible' : 'status-ineligible'}" style="margin-bottom: 0.75rem;">
              <div>
                ${isEligible ? '✅ Fully Eligible (100%)' : `⚠️ Criteria Partial (${eligibility.score}%)`}
              </div>
              ${opp.matchPercentage ? `<div class="ai-match-pill">✨ ${opp.matchPercentage}% AI Match</div>` : ''}
            </div>

            <div class="opp-card-footer">
              <button class="btn-details" data-action="view" data-id="${opp.id}">
                Details & Apply
              </button>
              <button class="btn-secondary" data-action="breakdown" data-id="${opp.id}">
                Eligibility
              </button>
              
              ${opp.applicationStatus || opp.isApplied ? `
                <span class="app-status-pill status-review" title="Application is currently in tracking">
                  📋 ${opp.applicationStatus || 'Applied'}
                </span>
              ` : ''}

              ${isAdmin ? `
                <button class="btn-secondary" data-action="delete" data-id="${opp.id}" style="color: var(--danger); border-color: rgba(239, 68, 68, 0.4);">
                  🗑️ Delete
                </button>
              ` : `
                <a href="${opp.link}" target="_blank" rel="noopener noreferrer" class="btn-apply ${isEligible ? '' : 'disabled'}" title="${isEligible ? 'Open official portal' : 'You do not meet the criteria for this opportunity'}">
                  ${isEligible ? 'Apply ↗' : 'Ineligible'}
                </a>
              `}
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach card event listeners
    attachCardListeners();
  }

  function getTypeIcon(type) {
    switch(type) {
      case 'internships': return '💼';
      case 'hackathons': return '⚡';
      case 'workshops': return '🛠️';
      case 'certifications': return '📜';
      case 'scholarships': return '🎓';
      case 'part-time': return '⏱️';
      default: return '📌';
    }
  }

  function formatType(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  function attachCardListeners() {
    // 1. Bookmark button click
    els.oppsGrid.querySelectorAll('[data-action="save"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const saved = await window.apiService.toggleSave(id);
        btn.classList.toggle('active', saved);
        btn.textContent = saved ? '★' : '☆';
        showToast(saved ? 'Opportunity bookmarked to your list ⭐' : 'Removed from bookmarks', 'info');
        updateKpis();
        if (state.activeTab === 'saved') refreshData();
      });
    });

    // 2. Eligibility Breakdown Modal Click
    els.oppsGrid.querySelectorAll('[data-action="breakdown"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        openEligibilityModal(id);
      });
    });

    // 2B. Details & Apply Modal Click
    els.oppsGrid.querySelectorAll('[data-action="view"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        openDetailModal(id);
      });
    });

    // Title Click to view details
    els.oppsGrid.querySelectorAll('.opp-title').forEach(titleEl => {
      titleEl.style.cursor = 'pointer';
      titleEl.addEventListener('click', () => {
        const card = titleEl.closest('.opp-card');
        if (card) openDetailModal(card.dataset.id);
      });
    });

    // 3. Admin Delete button click
    els.oppsGrid.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (confirm('Are you sure you want to delete this opportunity?')) {
          await window.apiService.deleteOpportunity(id);
          showToast('Opportunity removed successfully', 'danger');
          await refreshData();
        }
      });
    });
  }

  // 3B. Open Opportunity Details Modal
  function openDetailModal(oppId) {
    const opp = state.opportunities.find(o => o.id === oppId);
    if (!opp) return;

    const user = state.currentUser;
    const rules = opp.eligibility_rules || {};
    const result = opp.eligibility || window.CampusEngines.evaluateEligibility(user, rules);

    els.detailTypeBadge.textContent = formatType(opp.type);
    els.detailTypeBadge.className = `modal-badge type-${opp.type}`;
    els.detailTitle.textContent = opp.title;
    els.detailOrganizer.textContent = `${opp.organizer} • ${opp.location || 'REVA Campus'}`;
    els.detailStipend.textContent = opp.stipend || 'Specified in guidelines';
    els.detailLocation.textContent = opp.location || 'REVA Campus / Hybrid';
    els.detailDuration.textContent = opp.duration || 'Semester';
    els.detailDeadline.textContent = `${opp.deadline} (${getDaysLeft(opp.deadline)} days left)`;
    els.detailDesc.textContent = opp.description || 'Full specifications available in official portal link.';

    if (result.isEligible) {
      els.detailEligibilityBanner.className = 'card-match-banner status-eligible';
      els.detailEligibilityText.textContent = '✅ Verified Eligible (100% Criteria Met)';
      els.detailApplyActionBtn.classList.remove('disabled');
      els.detailApplyActionBtn.disabled = false;
      els.detailApplyActionBtn.textContent = (opp.applicationStatus || opp.isApplied) ? '✓ Application Submitted' : '📝 Submit Application';
    } else {
      els.detailEligibilityBanner.className = 'card-match-banner status-ineligible';
      els.detailEligibilityText.textContent = `⚠️ Criteria Partial (${result.score}%) - Check Breakdown`;
      els.detailApplyActionBtn.classList.add('disabled');
      els.detailApplyActionBtn.disabled = true;
      els.detailApplyActionBtn.textContent = 'Ineligible to Apply';
    }

    if (opp.matchPercentage) {
      els.detailAiMatchPill.textContent = `✨ ${opp.matchPercentage}% AI Match`;
      els.detailAiMatchPill.classList.remove('hidden');
    } else {
      els.detailAiMatchPill.classList.add('hidden');
    }

    els.detailTagsRow.innerHTML = (opp.tags || []).map(t => `<span class="tag-chip tag-highlight">${t}</span>`).join('');
    els.detailRulesGrid.innerHTML = `
      <div class="meta-row">Minimum CGPA: <strong>${rules.min_cgpa ?? 'None'}</strong></div>
      <div class="meta-row">Allowed Semesters: <strong>${(rules.semesters || []).join(', ') || 'All'}</strong></div>
      <div class="meta-row">Target Branches: <strong>${(rules.branches || []).join(', ') || 'All'}</strong></div>
      <div class="meta-row">Max Active Backlogs: <strong>${rules.max_backlogs ?? 'No limit'}</strong></div>
      <div class="meta-row" style="grid-column: 1 / -1;">Required Skills: <strong>${(rules.required_skills || []).join(', ') || 'No mandatory skills specified'}</strong></div>
    `;

    els.detailExternalLink.href = opp.link || 'https://reva.edu.in';
    els.detailBookmarkBtn.textContent = opp.isSaved ? '★ Bookmarked' : '☆ Bookmark';
    els.detailBookmarkBtn.onclick = async () => {
      const saved = await window.apiService.toggleSave(opp.id);
      opp.isSaved = saved;
      els.detailBookmarkBtn.textContent = saved ? '★ Bookmarked' : '☆ Bookmark';
      showToast(saved ? 'Opportunity bookmarked ⭐' : 'Removed from bookmarks');
      updateKpis();
    };

    els.detailApplyActionBtn.onclick = async () => {
      if (!result.isEligible && state.currentUser.role !== 'admin') {
        showToast('You do not meet the minimum criteria to apply.', 'danger');
        return;
      }
      const res = await window.apiService.applyOpportunity(opp.id);
      showToast(res.message, 'success');
      opp.isApplied = true;
      opp.applicationStatus = 'Applied';
      els.detailApplyActionBtn.textContent = '✓ Application Submitted';
      updateKpis();
    };

    els.detailModal.showModal();
  }

  // 4. Open Eligibility Breakdown Modal
  function openEligibilityModal(oppId) {
    const opp = state.opportunities.find(o => o.id === oppId);
    if (!opp) return;

    const user = state.currentUser;
    const rules = opp.eligibility_rules || {};
    const result = opp.eligibility || window.CampusEngines.evaluateEligibility(user, rules);

    els.modalOppTitle.textContent = opp.title;
    els.modalOppOrg.textContent = `${opp.organizer} • ${opp.location || 'REVA Campus'}`;
    els.modalStudentName.textContent = `${user.full_name} (${user.branch || 'Branch N/A'} Sem ${user.semester || 'N/A'}) • CGPA: ${user.cgpa || 'N/A'}`;

    els.modalScoreCircle.textContent = `${result.score}%`;
    if (result.isEligible) {
      els.modalScoreCircle.classList.remove('failed');
      els.modalScoreStatus.textContent = '✅ Fully Eligible to Apply';
      els.modalApplyBtn.classList.remove('disabled');
      els.modalApplyBtn.href = opp.link;
    } else {
      els.modalScoreCircle.classList.add('failed');
      els.modalScoreStatus.textContent = `❌ Does Not Qualify (${result.score}%)`;
      els.modalApplyBtn.classList.add('disabled');
      els.modalApplyBtn.href = '#';
    }

    // Render Rules Checklist
    let rulesHtml = '';

    // Passed rules
    (result.passedRules || []).forEach(r => {
      rulesHtml += `
        <div class="rule-item rule-passed">
          <span class="rule-icon">✅</span>
          <div>${r}</div>
        </div>
      `;
    });

    // Failed rules
    (result.failedRules || []).forEach(r => {
      rulesHtml += `
        <div class="rule-item rule-failed">
          <span class="rule-icon">❌</span>
          <div><strong>Requirement Not Met:</strong> ${r}</div>
        </div>
      `;
    });

    els.modalRulesList.innerHTML = rulesHtml;

    // Render Raw Requirement Parameters
    els.modalRawRulesGrid.innerHTML = `
      <div class="meta-row">Minimum CGPA: <strong>${rules.min_cgpa ?? 'None'}</strong></div>
      <div class="meta-row">Allowed Semesters: <strong>${(rules.semesters || []).join(', ') || 'All'}</strong></div>
      <div class="meta-row">Target Branches: <strong>${(rules.branches || []).join(', ') || 'All'}</strong></div>
      <div class="meta-row">Max Active Backlogs: <strong>${rules.max_backlogs ?? 'No limit'}</strong></div>
      <div class="meta-row" style="grid-column: 1 / -1;">Required Skills: <strong>${(rules.required_skills || []).join(', ') || 'No mandatory skills specified'}</strong></div>
    `;

    // Modal Bookmark button sync
    els.modalSaveBtn.onclick = async () => {
      const saved = await window.apiService.toggleSave(opp.id);
      showToast(saved ? 'Opportunity bookmarked ⭐' : 'Removed from bookmarks');
      opp.isSaved = saved;
      updateKpis();
    };

    els.eligibilityModal.showModal();
  }

  // 5. Open Recommender Math Breakdown Modal
  async function openTfidfModal() {
    const user = state.currentUser;
    const all = await window.apiService.getOpportunities('all');
    const eligible = all.filter(o => o.eligibility && o.eligibility.isEligible);
    const ranked = window.CampusEngines.rankRecommendations(user, eligible);

    // Populate student feature tags
    const studentTokens = [
      ...(user.skills || []),
      ...(user.interests || []),
      user.branch,
      'undergraduate'
    ];
    els.tfidfStudentTags.innerHTML = studentTokens.map(t => `<span class="tag-chip tag-highlight">${t}</span>`).join('');

    // Populate matrix table
    els.tfidfRankingTable.innerHTML = ranked.map((r, i) => `
      <tr>
        <td><strong>#${i + 1}</strong></td>
        <td><strong>${r.title}</strong><br><span style="color: var(--text-dim); font-size: 0.72rem;">${r.organizer}</span></td>
        <td><span class="type-badge type-${r.type}">${formatType(r.type)}</span></td>
        <td>${(r.matchedKeywords || []).map(k => `<span class="tag-chip">${k}</span>`).join(' ') || 'General'}</td>
        <td><code>${(r.recommendationScore || 0).toFixed(4)}</code></td>
        <td><strong style="color: var(--reva-gold);">${r.matchPercentage || 50}%</strong></td>
      </tr>
    `).join('');

    els.tfidfModal.showModal();
  }

  // 6. Navigation Tabs Switching
  els.mainNav.querySelectorAll('.nav-item').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      els.mainNav.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      tabBtn.classList.add('active');
      state.activeTab = tabBtn.dataset.tab;

      // Update Header Text
      if (state.activeTab === 'all') {
        els.viewTitle.textContent = 'All Opportunities';
        els.viewDesc.textContent = 'Explore verified campus events, internships, and scholarships for REVA University students.';
        els.showTfidfInfoBtn.classList.add('hidden');
        els.adminCreateTriggerBtn.classList.add('hidden');
      } else if (state.activeTab === 'recommended') {
        els.viewTitle.textContent = '✨ AI-Powered Personalized Recommendations';
        els.viewDesc.textContent = 'Content-based filtering matches your verified profile skills and interests using TF-IDF & Cosine Similarity.';
        els.showTfidfInfoBtn.classList.remove('hidden');
        els.adminCreateTriggerBtn.classList.add('hidden');
      } else if (state.activeTab === 'eligible') {
        els.viewTitle.textContent = '🎯 Opportunities You Qualify For';
        els.viewDesc.textContent = 'Filtered strictly where all CGPA, semester, branch, and backlog criteria are 100% satisfied.';
        els.showTfidfInfoBtn.classList.add('hidden');
        els.adminCreateTriggerBtn.classList.add('hidden');
      } else if (state.activeTab === 'saved') {
        els.viewTitle.textContent = '⭐ Bookmarked Opportunities';
        els.viewDesc.textContent = 'Your saved listings with active deadline countdown trackers.';
        els.showTfidfInfoBtn.classList.add('hidden');
        els.adminCreateTriggerBtn.classList.add('hidden');
      } else if (state.activeTab === 'applied') {
        els.viewTitle.textContent = '📋 Application Tracker';
        els.viewDesc.textContent = 'Monitor real-time progress and review status for opportunities you have applied for.';
        els.showTfidfInfoBtn.classList.add('hidden');
        els.adminCreateTriggerBtn.classList.add('hidden');
      } else if (state.activeTab === 'admin') {
        els.viewTitle.textContent = '⚙️ Faculty & Placement Admin Dashboard';
        els.viewDesc.textContent = 'Post new opportunities, define rule constraints, and broadcast alerts across REVA University.';
        els.showTfidfInfoBtn.classList.add('hidden');
        els.adminCreateTriggerBtn.classList.remove('hidden');
      }

      refreshData();
    });
  });

  // 7. Category Pills Filtering
  els.categoryPills.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      els.categoryPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeCategory = pill.dataset.type;
      refreshData();
    });
  });

  // 8. Persona Switcher Event (For Viva / Demo)
  if (els.personaSelect) {
    els.personaSelect.addEventListener('change', async (e) => {
      const selectedId = e.target.value;
      window.apiService.setUserId(selectedId);
      state.currentUser = await window.apiService.getProfile();
      updateUserUI();
      showToast(`Switched active profile to ${state.currentUser.full_name} (${state.currentUser.role.toUpperCase()})`, 'success');
      await loadNotifications();
      await refreshData();
    });
  }

  // 9. Real-time Search Input
  let searchTimeout;
  els.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const val = e.target.value.trim();
    state.searchQuery = val;
    els.clearSearchBtn.classList.toggle('hidden', val.length === 0);

    searchTimeout = setTimeout(() => {
      refreshData();
    }, 250);
  });

  els.clearSearchBtn.addEventListener('click', () => {
    els.searchInput.value = '';
    state.searchQuery = '';
    els.clearSearchBtn.classList.add('hidden');
    refreshData();
  });

  els.resetFilterBtn.addEventListener('click', () => {
    state.searchQuery = '';
    state.activeCategory = 'all';
    els.searchInput.value = '';
    els.categoryPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    els.categoryPills.querySelector('[data-type="all"]').classList.add('active');
    refreshData();
  });

  // 10. Notification Drawer Controls
  function toggleDrawer(open) {
    els.notifDrawer.classList.toggle('hidden', !open);
    els.notifDrawerBackdrop.classList.toggle('hidden', !open);
  }

  els.notifBellBtn.addEventListener('click', () => toggleDrawer(true));
  els.closeDrawerBtn.addEventListener('click', () => toggleDrawer(false));
  els.notifDrawerBackdrop.addEventListener('click', () => toggleDrawer(false));

  els.markAllReadBtn.addEventListener('click', async () => {
    await window.apiService.markAllNotificationsRead();
    await loadNotifications();
    showToast('All notifications marked as read', 'success');
  });

  // Trigger Cron Deadline Scan
  async function handleCronTrigger() {
    const res = await window.apiService.triggerDeadlineScheduler();
    showToast('⚡ Cron Deadline Check completed! Alerts dispatched.', 'success');
    await loadNotifications();
    await refreshData();
  }

  els.triggerSchedulerBtn.addEventListener('click', handleCronTrigger);
  els.triggerScanBtnDrawer.addEventListener('click', handleCronTrigger);

  // 11. Modal Close Handlers
  els.closeEligibilityModal.addEventListener('click', () => els.eligibilityModal.close());
  els.showTfidfInfoBtn.addEventListener('click', openTfidfModal);
  els.closeTfidfModal.addEventListener('click', () => els.tfidfModal.close());
  els.closeTfidfBtn.addEventListener('click', () => els.tfidfModal.close());

  // 12. Student Profile Edit Modal
  els.profileEditBtn.addEventListener('click', () => {
    const user = state.currentUser;
    els.profName.value = user.full_name || '';
    els.profBranch.value = user.branch || 'AIML';
    els.profSem.value = user.semester || 6;
    els.profCgpa.value = user.cgpa || 8.0;
    els.profBacklogs.value = user.backlogs || 0;
    els.profSkills.value = (user.skills || []).join(', ');
    els.profInterests.value = (user.interests || []).join(', ');
    els.profileModal.showModal();
  });

  els.closeProfileModal.addEventListener('click', () => els.profileModal.close());
  els.cancelProfileBtn.addEventListener('click', () => els.profileModal.close());

  els.profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updates = {
      full_name: els.profName.value.trim(),
      branch: els.profBranch.value,
      semester: parseInt(els.profSem.value, 10),
      cgpa: parseFloat(els.profCgpa.value),
      backlogs: parseInt(els.profBacklogs.value, 10),
      skills: els.profSkills.value.split(',').map(s => s.trim()).filter(Boolean),
      interests: els.profInterests.value.split(',').map(i => i.trim()).filter(Boolean)
    };

    state.currentUser = await window.apiService.updateProfile(updates);
    updateUserUI();
    els.profileModal.close();
    showToast('Profile parameters updated! Recomputed eligibility.', 'success');
    await refreshData();
  });

  // 13. Admin Opportunity Creation Modal
  els.adminCreateTriggerBtn.addEventListener('click', () => {
    els.adminModal.showModal();
  });
  els.closeAdminModal.addEventListener('click', () => els.adminModal.close());
  els.cancelAdminBtn.addEventListener('click', () => els.adminModal.close());

  els.adminCreateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Gather selected branches
    const branches = Array.from(document.querySelectorAll('input[name="rule-branch"]:checked')).map(cb => cb.value);
    const semesters = Array.from(document.querySelectorAll('input[name="rule-sem"]:checked')).map(cb => parseInt(cb.value, 10));
    const reqSkills = document.getElementById('rule-skills').value.split(',').map(s => s.trim()).filter(Boolean);

    const newOppData = {
      title: document.getElementById('opp-title').value.trim(),
      type: document.getElementById('opp-type').value,
      organizer: document.getElementById('opp-organizer').value.trim(),
      location: document.getElementById('opp-location').value.trim(),
      stipend: document.getElementById('opp-stipend').value.trim(),
      duration: document.getElementById('opp-duration').value.trim(),
      deadline: document.getElementById('opp-deadline').value,
      link: document.getElementById('opp-link').value.trim() || 'https://reva.edu.in',
      description: document.getElementById('opp-desc').value.trim(),
      tags: document.getElementById('opp-tags').value.split(',').map(t => t.trim()).filter(Boolean),
      eligibility_rules: {
        min_cgpa: parseFloat(document.getElementById('rule-min-cgpa').value) || 0,
        max_backlogs: parseInt(document.getElementById('rule-max-backlogs').value, 10) || 0,
        branches: branches.length > 0 ? branches : ['ALL'],
        semesters: semesters.length > 0 ? semesters : [1,2,3,4,5,6,7,8],
        required_skills: reqSkills
      }
    };

    const result = await window.apiService.createOpportunity(newOppData);
    els.adminModal.close();
    els.adminCreateForm.reset();
    showToast(`Opportunity "${newOppData.title}" published! Automatic notifications dispatched.`, 'success');
    await loadNotifications();
    await refreshData();
  });

  // 14. Details Modal Close Handler
  if (els.closeDetailModal) {
    els.closeDetailModal.addEventListener('click', () => els.detailModal.close());
  }

  // 15. Authentication Modal & Form Handlers
  if (els.authModalBtn) {
    els.authModalBtn.addEventListener('click', () => els.authModal.showModal());
  }
  if (els.closeAuthModal) {
    els.closeAuthModal.addEventListener('click', () => els.authModal.close());
  }

  if (els.authTabLogin && els.authTabSignup) {
    els.authTabLogin.addEventListener('click', () => {
      els.authTabLogin.classList.add('active');
      els.authTabSignup.classList.remove('active');
      els.loginForm.classList.remove('hidden');
      els.signupForm.classList.add('hidden');
    });

    els.authTabSignup.addEventListener('click', () => {
      els.authTabSignup.classList.add('active');
      els.authTabLogin.classList.remove('active');
      els.signupForm.classList.remove('hidden');
      els.loginForm.classList.add('hidden');
    });
  }

  // Demo account quick login clicks
  document.querySelectorAll('.demo-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const email = btn.dataset.email;
      const res = await window.apiService.login(email);
      if (res.success) {
        state.currentUser = res.user;
        if (els.personaSelect) els.personaSelect.value = res.user.id;
        updateUserUI();
        els.authModal.close();
        showToast(res.message, 'success');
        await loadNotifications();
        await refreshData();
      }
    });
  });

  // Login form submit
  if (els.loginForm) {
    els.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const res = await window.apiService.login(email);
      if (res.success) {
        state.currentUser = res.user;
        if (els.personaSelect) els.personaSelect.value = res.user.id;
        updateUserUI();
        els.authModal.close();
        showToast(res.message, 'success');
        await loadNotifications();
        await refreshData();
      } else {
        showToast(res.message, 'danger');
      }
    });
  }

  // Sign up form submit
  if (els.signupForm) {
    els.signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userData = {
        full_name: document.getElementById('reg-name').value.trim(),
        email: document.getElementById('reg-email').value.trim(),
        branch: document.getElementById('reg-branch').value,
        semester: parseInt(document.getElementById('reg-sem').value, 10),
        cgpa: parseFloat(document.getElementById('reg-cgpa').value),
        backlogs: parseInt(document.getElementById('reg-backlogs').value, 10),
        skills: document.getElementById('reg-skills').value.split(',').map(s => s.trim()).filter(Boolean),
        interests: document.getElementById('reg-interests').value.split(',').map(i => i.trim()).filter(Boolean)
      };

      const res = await window.apiService.signup(userData);
      if (res.success) {
        state.currentUser = res.user;
        updateUserUI();
        els.authModal.close();
        showToast(`Welcome to CampusConnect, ${res.user.full_name}!`, 'success');
        await loadNotifications();
        await refreshData();
      }
    });
  }

  // Start app
  initApp();
});

