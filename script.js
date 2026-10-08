/* ================================================================
   MISSION: PLAY — script.js
   ================================================================ */

const firebaseConfig = {
    apiKey: "AIzaSyBO86fXhg1EO4shpF699lQ-CWkiB6gZHao",
    authDomain: "mission-play.firebaseapp.com",
    databaseURL: "https://mission-play-default-rtdb.firebaseio.com",
    projectId: "mission-play",
    storageBucket: "mission-play.firebasestorage.app",
    messagingSenderId: "1064686412113",
    appId: "1:1064686412113:web:d9067a5ba7ee8cbe207370"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const googleProvider = new firebase.auth.GoogleAuthProvider();

const MEMBERS = [
    { name: 'DarkTeddy', role: 'Gamer', avatar: 'https://cdn.discordapp.com/avatars/1063112261931110423/7a56ce3ede9ae5400c3b7f40989cf783.png?size=4096' },
    { name: 'KEROSENE', role: 'Fullstack Dev', avatar: 'https://cdn.discordapp.com/avatars/1232394805213003817/548ebf47f06465022b97706775cbcfa9.png?size=4096', isAdmin: true },
    { name: 'ArLovelyy', role: 'Gamer', avatar: 'https://cdn.discordapp.com/avatars/1518641453373460572/f6ee5cfbc901926edc0576960ec91a78.png?size=4096' }
];

let currentUser = null;
let firebaseUser = null;
let memberSlots = {};
let memberUserData = {};
let nowPlayingByMember = {};
let selectedMember = null;
let currentFilter = null;
let previewFrame = 'gold';
let previewAnim = 'none';
let recommendation = null;
let playlist = {};
let ytPlayer = null;
let ytPlayerReady = false;
let ytApiLoading = false;
let currentMusic = null;
let authProcessing = false;

const gamesData = [
    { id: 1, title: 'DayZ', genre: 'Survival', desc: 'Fight to survive in a cannibal-infested forest. Build, craft, and defend yourself against terrifying mutants.', rating: '9.9', downloads: '2.1M', image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg', link: 'https://dayzavr.ru/download.html', badge: '🔥 Hot', category: 'survival' },
    { id: 2, title: 'Funnel Runners', genre: 'Survival', desc: 'Trapped in a doomed city, you and up to 7 friends must scavenge parts, fix your van, and escape the brutal tornado.', rating: '7.6', downloads: '25.8k', image: 'https://steamrip.com/wp-content/uploads/2024/08/Funnel-Runners.jpg', link: 'https://steamrip.com/funnel-runners-free-download/', badge: 'Online Soon', category: 'survival' },
    { id: 3, title: 'Sons Of The Forest', genre: 'Horror / Survival', desc: 'Fight to survive in a cannibal-infested forest. Build, craft, and defend yourself against terrifying mutants.', rating: '9.4', downloads: '2.1M', image: 'https://wallpapercave.com/wp/wp12152116.jpg', link: 'https://gtorr.net/index.php?newsid=3928', badge: '🔥 Hot', category: 'survival' },
    { id: 4, title: 'Backrooms: Escape Together', genre: 'Horror', desc: 'Survive in infinite levels of Backroom.', rating: '9.1', downloads: '1.2M', image: 'https://cdn.akamai.steamstatic.com/steam/apps/2141730/ss_7e94b69940005e3ba12c63d6ccc56386ff9141a9.jpg?t=1668069333', link: 'https://gtorr.net/index.php?newsid=3818', badge: '🆕 New', category: 'horror' },
    { id: 5, title: 'Shift At Midnight', genre: 'Horror', desc: 'Survive in store.', rating: '9.1', downloads: '1.2M', image: 'https://gtorr.net/uploads/posts/2026-08/1787854284_library_capsule.jpg', link: 'https://gtorr.net/index.php?newsid=5283', badge: '🆕 New', category: 'horror' },
    { id: 6, title: 'WE ARE SO DEAD', genre: 'Horror', desc: 'Co-op horror game.', rating: '7.0', downloads: '388K', image: 'https://steamrip.com/wp-content/uploads/2026/08/WE_ARE_SO_DEAD_featured_steamrip.jpg', link: 'https://steamrip.com/we-are-so-dead-free-download/', badge: '🆕 New', category: 'horror' },
    { id: 7, title: 'Long Drive North', genre: 'Survival', desc: 'Co-op funny survival game.', rating: '5.0', downloads: '15K', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDtOIEeDO-siGUTHup29dTsQxNEQ5B8Eth38yQAo5ppQiK0T7igUcZKH_rSK-iArOV_5dQK-syo96vKw0WtdSj9TkhqwLD94tPmhTNbjqG3w&s=10', link: 'https://drive.google.com/drive/folders/1CmEXv0uRAkEzfo1Nxjj6fW7L4UjlifNU?usp=sharing', badge: '🆕 New', category: 'horror' }
];

const categoriesData = [
    { icon: '🚗', name: 'cars' },
    { icon: '👻', name: 'horror' },
    { icon: '🧟', name: 'survival' }
];

const themesData = [
    { id: 'royal-gold', name: 'Royal Gold', colors: ['#06060a', '#d4a745', '#f0d078'] },
    { id: 'cyber-neon', name: 'Cyber Neon', colors: ['#050510', '#00e5ff', '#ff00e5'] },
    { id: 'emerald', name: 'Emerald', colors: ['#040a06', '#10b981', '#4ade80'] },
    { id: 'blood-moon', name: 'Blood Moon', colors: ['#0a0303', '#ef4444', '#f97316'] },
    { id: 'frost', name: 'Frost', colors: ['#050a14', '#7dd3fc', '#c7d2fe'] },
    { id: 'sunset', name: 'Sunset', colors: ['#0a0410', '#f97316', '#a855f7'] },
    { id: 'matrix', name: 'Matrix', colors: ['#020a02', '#22c55e', '#86efac'] },
    { id: 'sakura', name: 'Sakura', colors: ['#0a040a', '#f472b6', '#c084fc'] },
    { id: 'ocean', name: 'Deep Ocean', colors: ['#030814', '#06b6d4', '#3b82f6'] },
    { id: 'void', name: 'Void', colors: ['#000000', '#ffffff', '#737373'] }
];

const framesData = ['none', 'gold', 'neon', 'fire', 'ice', 'rainbow', 'legendary', 'hacker', 'royal'];
const animationsData = ['none', 'pulse', 'glow', 'rotate', 'pulseGlow', 'shake', 'spinPulse'];

function $(id) { return document.getElementById(id); }
function toast(msg, type = '') {
    const t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast show ' + type;
    clearTimeout(t._to);
    t._to = setTimeout(() => t.className = 'toast ' + type, 3000);
}
function defaultAvatar(name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=222&color=f0d078&size=200&bold=true`;
}
function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ============ AUTO-MIGRATE OverRuled → KEROSENE ============ */
async function silentMigrate() {
    try {
        const oldSlot = await db.ref('memberSlots/OverRuled').once('value');
        const newSlot = await db.ref('memberSlots/KEROSENE').once('value');
        if (oldSlot.exists() && !newSlot.exists()) {
            const uid = oldSlot.val();
            await db.ref('memberSlots/KEROSENE').set(uid);
            await db.ref('memberSlots/OverRuled').remove();
            await db.ref('users/' + uid + '/memberName').set('KEROSENE');
            const oldPP = await db.ref('publicProfiles/OverRuled').once('value');
            if (oldPP.exists()) {
                await db.ref('publicProfiles/KEROSENE').set(oldPP.val());
                await db.ref('publicProfiles/OverRuled').remove();
            }
            const recSnap = await db.ref('recommendation').once('value');
            if (recSnap.exists() && recSnap.val().recommendedBy === 'OverRuled') {
                await db.ref('recommendation/recommendedBy').set('KEROSENE');
            }
        }
    } catch (e) { console.warn('Migration:', e.message); }
}

/* ============ PUBLIC PROFILE SYNC ============ */
async function syncPublicProfile(memberName, data) {
    if (!memberName) return;
    try {
        await db.ref('publicProfiles/' + memberName).update(data);
    } catch (err) { console.warn('Public sync:', err.message); }
}

/* ============ NOW PLAYING ============ */
function listenNowPlaying() {
    // Source 1: nowPlaying (uid-based, real-time)
    db.ref('nowPlaying').on('value', snap => {
        const np = snap.val() || {};
        nowPlayingByMember = {};
        for (const uid in np) {
            const data = np[uid];
            if (data && data.memberName) {
                nowPlayingByMember[data.memberName] = data;
            }
        }
        renderHeroProfiles();
    }, () => {});
}

async function setNowPlaying(data) {
    if (!firebaseUser || !currentUser) return;
    try {
        const payload = {
            memberName: currentUser.memberName,
            videoId: data?.videoId || '',
            title: data?.title || '',
            playing: data?.playing === true,
            updatedAt: Date.now()
        };
        // Write BOTH places
        await db.ref('nowPlaying/' + firebaseUser.uid).set(payload).catch(e => console.warn('nowPlaying write:', e.message));
        await db.ref('publicProfiles/' + currentUser.memberName + '/music').set(payload).catch(e => console.warn('publicProfiles write:', e.message));
        // Update local cache instantly
        nowPlayingByMember[currentUser.memberName] = payload;
        renderHeroProfiles();
    } catch (err) { console.warn('setNowPlaying:', err.message); }
}

/* ============ THEME ============ */
function applyTheme(themeId) {
    document.body.setAttribute('data-theme', themeId);
    localStorage.setItem('mp-theme', themeId);
    if (firebaseUser) db.ref('users/' + firebaseUser.uid + '/theme').set(themeId).catch(() => {});
    document.querySelectorAll('.theme-card').forEach(c => c.classList.toggle('selected', c.dataset.theme === themeId));
}
function initTheme() { applyTheme(localStorage.getItem('mp-theme') || 'royal-gold'); }
function renderThemes() {
    const grid = $('themesGrid'); if (!grid) return;
    grid.innerHTML = themesData.map(t => `
        <div class="theme-card" data-theme="${t.id}">
            <div class="theme-swatch"><span style="background:${t.colors[0]}"></span><span style="background:${t.colors[1]}"></span><span style="background:${t.colors[2]}"></span></div>
            <div class="theme-name">${t.name}</div>
        </div>`).join('');
    grid.querySelectorAll('.theme-card').forEach(card => card.addEventListener('click', () => {
        applyTheme(card.dataset.theme);
        toast('🎨 ' + themesData.find(t => t.id === card.dataset.theme).name, 'success');
    }));
    const cur = document.body.getAttribute('data-theme');
    grid.querySelectorAll('.theme-card').forEach(c => c.classList.toggle('selected', c.dataset.theme === cur));
}
function openThemeModal() { $('themeModal').classList.add('active'); }
function closeThemeModal() { $('themeModal').classList.remove('active'); }

/* ============ MEMBER SLOTS ============ */
function listenMemberSlots() {
    db.ref('memberSlots').on('value', snap => {
        memberSlots = snap.val() || {};
        renderHeroProfiles();
        if ($('authModal')?.classList.contains('active')) {
            renderMemberOptions();
            checkRegistrationAvailability();
        }
    });
}

function listenPublicProfiles() {
    db.ref('publicProfiles').on('value', snap => {
        const pp = snap.val() || {};
        for (const name in pp) {
            memberUserData[name] = Object.assign({}, memberUserData[name] || {}, pp[name]);
            // music fallback
            if (pp[name]?.music && pp[name].music.title && !nowPlayingByMember[name]) {
                nowPlayingByMember[name] = pp[name].music;
            }
        }
        renderHeroProfiles();
    }, () => {});
}

function listenUsers() {
    if (!firebaseUser) return;
    db.ref('users').on('value', snap => {
        const users = snap.val() || {};
        for (const uid in users) {
            const u = users[uid];
            if (u && u.memberName) {
                memberUserData[u.memberName] = Object.assign({}, memberUserData[u.memberName] || {}, u);
            }
        }
        renderHeroProfiles();
    }, () => {});
}

function allMembersTaken() { return MEMBERS.every(m => memberSlots[m.name]); }

function renderMemberOptions() {
    const container = $('memberOptions'); if (!container) return;
    container.innerHTML = MEMBERS.map(m => {
        const taken = !!memberSlots[m.name];
        return `
            <div class="member-option ${taken ? 'taken' : ''}" data-member="${m.name}">
                <img src="${m.avatar}" alt="${m.name}">
                <span class="name">${m.name}</span>
                <span class="role">${m.role}</span>
                ${m.name === 'KEROSENE' ? '<span class="role" style="color:#ffd700;">👑 Admin</span>' : ''}
            </div>`;
    }).join('');
    container.querySelectorAll('.member-option').forEach(opt => opt.addEventListener('click', () => {
        if (opt.classList.contains('taken')) { toast('🔒 Already claimed', 'error'); return; }
        container.querySelectorAll('.member-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedMember = opt.dataset.member;
    }));
}

function checkRegistrationAvailability() {
    const registerForm = $('registerForm'), loginForm = $('loginForm'), noReg = $('noRegisterMsg'), tabRegister = $('tabRegister');
    if (allMembersTaken()) {
        if (tabRegister) tabRegister.style.display = 'none';
        switchAuthTab('login');
        if (noReg) noReg.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
        if (loginForm) loginForm.style.display = 'flex';
    } else {
        if (tabRegister) tabRegister.style.display = '';
        if (noReg) noReg.style.display = 'none';
    }
}

/* ============ HERO PROFILES ============ */
function renderHeroProfiles() {
    const container = $('heroProfiles'); if (!container) return;
    container.innerHTML = MEMBERS.map(m => {
        const uid = memberSlots[m.name];
        const isClaimed = !!uid;
        const isAdmin = m.name === 'KEROSENE';
        const userData = memberUserData[m.name];
        const avatar = userData?.avatar || m.avatar;
        const frame = userData?.frame || (isAdmin ? 'royal' : 'gold');
        const anim = userData?.frameAnimation || (isAdmin ? 'glow' : 'none');
        const nickname = userData?.nickname || m.name;

        const music = nowPlayingByMember[m.name];
        const isPlaying = music?.playing === true && music?.title;
        const musicBadge = isPlaying ? `
            <div class="profile-music" title="${escapeHtml(music.title)}">
                <span class="music-eq"><i></i><i></i><i></i><i></i></span>
                <span class="music-title">${escapeHtml(music.title)}</span>
            </div>` : '';

        return `
            <div class="profile-card ${isAdmin ? 'is-admin' : ''}">
                <div class="avatar-wrapper" data-frame="${frame}" data-anim="${anim}">
                    <img src="${avatar}" alt="${m.name}" onerror="this.src='${defaultAvatar(m.name)}'">
                </div>
                <span class="profile-name">${escapeHtml(nickname)}</span>
                <span class="profile-role">${m.role}</span>
                ${isAdmin ? '<span class="developer-badge">👑 Developer</span>' : ''}
                ${isClaimed ? '<span class="claimed-badge">✓ Registered</span>' : '<span class="claimed-badge">Available</span>'}
                ${musicBadge}
            </div>`;
    }).join('');
}

/* ============ RECOMMENDATION ============ */
function listenRecommendation() {
    db.ref('recommendation').on('value', snap => { recommendation = snap.val(); renderAdminPick(); });
}
function renderAdminPick() {
    const container = $('adminPickSection'); if (!container) return;
    if (!recommendation || !recommendation.gameId) { container.style.display = 'none'; container.innerHTML = ''; return; }
    const g = gamesData.find(x => x.id === recommendation.gameId);
    if (!g) { container.style.display = 'none'; return; }
    container.style.display = 'block';
    container.innerHTML = `
        <div class="admin-pick-card">
            <img src="${g.image}" alt="${g.title}" onerror="this.src='https://picsum.photos/seed/${g.id}/800/500'">
            <div class="admin-pick-info">
                <h3>${g.title}</h3>
                <div class="by">👑 Recommended by ${escapeHtml(recommendation.recommendedBy || 'Admin')}</div>
                <p class="pick-desc">${g.desc}</p>
                <div class="pick-meta">
                    <span>⭐ <span class="val">${g.rating}</span></span>
                    <span>📥 <span class="val">${g.downloads}</span></span>
                    <span>🎮 <span class="val" style="text-transform:capitalize;">${g.genre}</span></span>
                </div>
                <div><button class="btn-primary" onclick="openGameModal(${g.id})">🎮 View Game</button></div>
            </div>
        </div>`;
}
function populateRecommendSelect() {
    const select = $('recommendGameSelect'); if (!select) return;
    select.innerHTML = '<option value="">— აირჩიე თამაში —</option>' + gamesData.map(g => `<option value="${g.id}">${g.title} (${g.genre})</option>`).join('');
    if (recommendation?.gameId) select.value = recommendation.gameId;
}

/* ============ AUTH MODAL ============ */
function openAuthModal(tab = 'login') {
    if (firebaseUser && currentUser) { openProfileModal(); return; }
    $('authModal').classList.add('active');
    renderMemberOptions();
    checkRegistrationAvailability();
    switchAuthTab(tab);
}
function closeAuthModal() { $('authModal').classList.remove('active'); }

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    $('loginForm').style.display = tab === 'login' ? 'flex' : 'none';
    if (tab === 'register' && !allMembersTaken()) {
        $('registerForm').style.display = 'flex';
        $('noRegisterMsg').style.display = 'none';
    } else if (tab === 'register') {
        $('registerForm').style.display = 'none';
        $('noRegisterMsg').style.display = 'block';
    } else {
        $('registerForm').style.display = 'none';
        $('noRegisterMsg').style.display = 'none';
    }
}
document.querySelectorAll('.auth-tab').forEach(tab => tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab)));
function openProfileOrAuth() { if (firebaseUser && currentUser) openProfileModal(); else openAuthModal('login'); }

/* ============ REGISTRATION / LOGIN ============ */
async function claimMemberSlot(memberName, uid) {
    const ref = db.ref('memberSlots/' + memberName);
    const result = await ref.transaction(current => { if (current) return; return uid; });
    return result.committed;
}
async function saveUserRecord(uid, data) { await db.ref('users/' + uid).set(data); }

$('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = $('registerError');
    errEl.textContent = ''; errEl.className = 'auth-error';
    const email = $('regEmail').value.trim();
    const password = $('regPassword').value;
    if (!selectedMember) { errEl.textContent = '⚠️ Please choose your identity'; return; }
    if (memberSlots[selectedMember]) { errEl.textContent = '🔒 Already claimed'; return; }
    let cred = null;
    try {
        cred = await auth.createUserWithEmailAndPassword(email, password);
        const uid = cred.user.uid;
        const claimed = await claimMemberSlot(selectedMember, uid);
        if (!claimed) { await cred.user.delete(); errEl.textContent = '🔒 Claimed by someone else'; return; }
        const role = selectedMember === 'KEROSENE' ? 'admin' : 'member';
        const memberInfo = MEMBERS.find(m => m.name === selectedMember);
        try {
            await saveUserRecord(uid, {
                email, memberName: selectedMember, nickname: selectedMember,
                avatar: memberInfo.avatar, frame: role === 'admin' ? 'royal' : 'gold',
                frameAnimation: role === 'admin' ? 'glow' : 'none',
                theme: localStorage.getItem('mp-theme') || 'royal-gold', role, createdAt: Date.now()
            });
            await syncPublicProfile(selectedMember, {
                nickname: selectedMember, avatar: memberInfo.avatar,
                frame: role === 'admin' ? 'royal' : 'gold',
                frameAnimation: role === 'admin' ? 'glow' : 'none', role
            });
        } catch (dbErr) {
            await db.ref('memberSlots/' + selectedMember).remove().catch(() => {});
            await cred.user.delete().catch(() => {});
            throw new Error('DB: ' + dbErr.message);
        }
        toast('🎉 Welcome, ' + selectedMember + '!', 'success');
        closeAuthModal();
    } catch (err) { errEl.textContent = '❌ ' + (err.message || 'Registration failed'); }
});

$('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = $('loginError'); errEl.textContent = '';
    try {
        await auth.signInWithEmailAndPassword($('loginEmail').value.trim(), $('loginPassword').value);
        toast('✅ Welcome back!', 'success'); closeAuthModal();
    } catch (err) { errEl.textContent = '❌ ' + (err.message || 'Login failed'); }
});

/* ============ GOOGLE AUTH ============ */
async function googleAuth(isRegister) {
    const errEl = isRegister ? $('registerError') : $('loginError');
    if (errEl) { errEl.textContent = ''; errEl.className = 'auth-error'; }
    if (isRegister) {
        if (!selectedMember) { if (errEl) errEl.textContent = '⚠️ ჯერ აირჩიე ვინ ხარ'; toast('⚠️ აირჩიე წევრი', 'error'); return; }
        if (memberSlots[selectedMember]) { if (errEl) errEl.textContent = '🔒 უკვე დაკავებულია'; return; }
        localStorage.setItem('mp-pending-member', selectedMember);
        localStorage.setItem('mp-pending-register', 'true');
    } else {
        localStorage.removeItem('mp-pending-member');
        localStorage.removeItem('mp-pending-register');
    }
    try {
        await auth.signInWithRedirect(googleProvider);
    } catch (err) {
        if (errEl) errEl.textContent = '❌ ' + (err.message || 'Google auth failed');
        toast('❌ ' + (err.message || 'Google auth failed'), 'error');
    }
}
$('googleLoginBtn')?.addEventListener('click', () => googleAuth(false));
$('googleRegisterBtn')?.addEventListener('click', () => googleAuth(true));

/* ============ UNIFIED AUTH PROCESSOR ============ */
async function processAuth(user) {
    if (!user) return;
    if (authProcessing) return;
    authProcessing = true;

    try {
        // 1. Run migration (once)
        await silentMigrate();

        // 2. Check if user has record
        let snap = await db.ref('users/' + user.uid).once('value');
        if (snap.exists()) {
            // Existing user
            currentUser = snap.val();
            if (currentUser.theme) applyTheme(currentUser.theme);
            updateAuthUI();
            db.ref('users/' + user.uid + '/music/playing').onDisconnect().set(false);
            db.ref('nowPlaying/' + user.uid).onDisconnect().remove().catch(() => {});
            listenPlaylist();
            listenUsers();
            if (currentUser.music?.videoId) {
                currentMusic = { videoId: currentUser.music.videoId, title: currentUser.music.title || '🎵 Track' };
            }
            updateMusicUI();
            return;
        }

        // 3. No record — check for pending registration
        const isRegister = localStorage.getItem('mp-pending-register') === 'true';
        const pendingMember = localStorage.getItem('mp-pending-member');

        if (!isRegister || !pendingMember) {
            // No pending registration → orphan user, sign out
            console.log('No pending registration, signing out orphan user');
            await auth.signOut();
            return;
        }

        // 4. Complete pending registration
        if (memberSlots[pendingMember]) {
            await auth.signOut();
            toast('🔒 წევრი უკვე დაკავებულია', 'error');
            localStorage.removeItem('mp-pending-member');
            localStorage.removeItem('mp-pending-register');
            return;
        }

        const claimed = await claimMemberSlot(pendingMember, user.uid);
        if (!claimed) {
            await auth.signOut();
            toast('🔒 წევრი უკვე დაკავებულია', 'error');
            localStorage.removeItem('mp-pending-member');
            localStorage.removeItem('mp-pending-register');
            return;
        }

        const role = pendingMember === 'KEROSENE' ? 'admin' : 'member';
        const memberInfo = MEMBERS.find(m => m.name === pendingMember);
        const initialAvatar = user.photoURL || memberInfo.avatar;
        const initialNick = user.displayName || pendingMember;

        try {
            await saveUserRecord(user.uid, {
                email: user.email, memberName: pendingMember, nickname: initialNick,
                avatar: initialAvatar, frame: role === 'admin' ? 'royal' : 'gold',
                frameAnimation: role === 'admin' ? 'glow' : 'none',
                theme: localStorage.getItem('mp-theme') || 'royal-gold', role, createdAt: Date.now()
            });
            await syncPublicProfile(pendingMember, {
                nickname: initialNick, avatar: initialAvatar,
                frame: role === 'admin' ? 'royal' : 'gold',
                frameAnimation: role === 'admin' ? 'glow' : 'none', role
            });
            localStorage.removeItem('mp-pending-member');
            localStorage.removeItem('mp-pending-register');
            toast('🎉 Welcome, ' + pendingMember + '!', 'success');
            closeAuthModal();
        } catch (dbErr) {
            await db.ref('memberSlots/' + pendingMember).remove().catch(() => {});
            await auth.signOut().catch(() => {});
            localStorage.removeItem('mp-pending-member');
            localStorage.removeItem('mp-pending-register');
            toast('❌ ' + dbErr.message, 'error');
        }
    } catch (err) {
        console.error('processAuth error:', err);
    } finally {
        authProcessing = false;
    }
}

/* onAuthStateChanged — primary entry point */
auth.onAuthStateChanged(async (user) => {
    firebaseUser = user;
    if (user) {
        // Small delay to let redirect result settle
        await new Promise(r => setTimeout(r, 400));
        await processAuth(user);
    } else {
        currentUser = null;
        playlist = {};
        renderPlaylist();
        updateAuthUI();
    }
});

/* getRedirectResult — secondary entry point (in case onAuthStateChanged didn't catch) */
auth.getRedirectResult().then(async (result) => {
    if (result?.user) {
        firebaseUser = result.user;
        await processAuth(result.user);
    }
}).catch(err => console.warn('Redirect result:', err.message));

/* ============ UPDATE UI ============ */
function updateAuthUI() {
    const authBtn = $('authBtn'), profileBtn = $('profileNavBtn'), mobileLink = $('mobileAuthLink');
    if (firebaseUser && currentUser) {
        if (authBtn) authBtn.style.display = 'none';
        if (profileBtn) profileBtn.style.display = 'flex';
        if (mobileLink) mobileLink.textContent = '👤 ' + (currentUser.nickname || 'Profile');
        const navWrap = profileBtn.querySelector('.avatar-wrapper');
        const navImg = $('navAvatar');
        if (navWrap) { navWrap.dataset.frame = currentUser.frame || 'gold'; navWrap.dataset.anim = currentUser.frameAnimation || 'none'; }
        if (navImg) navImg.src = currentUser.avatar || defaultAvatar(currentUser.nickname);
        const navNick = $('navNick');
        if (navNick) navNick.textContent = currentUser.nickname || 'User';
    } else {
        if (authBtn) { authBtn.style.display = 'block'; authBtn.textContent = '👤 Sign In'; }
        if (profileBtn) profileBtn.style.display = 'none';
        if (mobileLink) mobileLink.textContent = '👤 Sign In';
    }
}

/* ============ PROFILE MODAL ============ */
function openProfileModal() {
    if (!currentUser) return;
    $('profileModal').classList.add('active');
    fillProfileForm(); renderFramesGrid(); renderAnimationsGrid(); updateProfileHeader();
    const adminTab = $('adminTab');
    if (currentUser.role === 'admin') { adminTab.style.display = 'block'; loadAdminUsers(); populateRecommendSelect(); }
    else adminTab.style.display = 'none';
    switchProfileTab('edit');
}
function closeProfileModal() { $('profileModal').classList.remove('active'); }
function switchProfileTab(tab) {
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.toggle('active', t.dataset.ptab === tab));
    ['edit', 'frames', 'admin'].forEach(t => { const el = $('ptab-' + t); if (el) el.style.display = t === tab ? 'flex' : 'none'; });
}
document.querySelectorAll('.profile-tab').forEach(tab => tab.addEventListener('click', () => switchProfileTab(tab.dataset.ptab)));

function fillProfileForm() {
    if (!currentUser) return;
    $('editNickname').value = currentUser.nickname || '';
    $('editAvatarUrl').value = currentUser.avatar?.startsWith('data:') ? '' : (currentUser.avatar || '');
    previewFrame = currentUser.frame || 'gold';
    previewAnim = currentUser.frameAnimation || 'none';
}
function updateProfileHeader() {
    if (!currentUser) return;
    $('profileDisplayName').textContent = currentUser.nickname || 'User';
    $('profileMemberName').textContent = 'Member: ' + (currentUser.memberName || '—');
    $('profileEmail').textContent = currentUser.email || '';
    const roleBadge = $('profileRoleBadge');
    roleBadge.textContent = currentUser.role === 'admin' ? '👑 Admin' : 'Member';
    roleBadge.className = 'role-badge' + (currentUser.role === 'admin' ? ' admin' : '');
    const wrap = $('profileAvatarWrapper');
    wrap.dataset.frame = currentUser.frame || 'gold';
    wrap.dataset.anim = currentUser.frameAnimation || 'none';
    $('profileAvatarImg').src = currentUser.avatar || defaultAvatar(currentUser.nickname);
}

$('saveProfileBtn')?.addEventListener('click', async () => {
    if (!currentUser || !firebaseUser) return;
    const msg = $('profileSaveMsg'); msg.textContent = ''; msg.className = 'auth-error';
    const nickname = $('editNickname').value.trim() || currentUser.memberName;
    const avatarUrl = $('editAvatarUrl').value.trim();
    const fileInput = $('editAvatarFile');
    let avatar = currentUser.avatar;
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (file.size > 2 * 1024 * 1024) { msg.textContent = '⚠️ Image too large (max 2MB)'; return; }
        avatar = await fileToBase64(file);
    } else if (avatarUrl) { avatar = avatarUrl; }
    try {
        await db.ref('users/' + firebaseUser.uid).update({ nickname, avatar });
        await syncPublicProfile(currentUser.memberName, { nickname, avatar });
        currentUser.nickname = nickname; currentUser.avatar = avatar;
        updateProfileHeader(); updateAuthUI();
        msg.textContent = '✅ Profile saved!'; msg.className = 'auth-error success';
        toast('💾 Profile updated', 'success');
    } catch (err) { msg.textContent = '❌ ' + err.message; }
});

$('useDiscordAvatarBtn')?.addEventListener('click', async () => {
    if (!currentUser || !firebaseUser) return;
    const memberInfo = MEMBERS.find(m => m.name === currentUser.memberName);
    if (!memberInfo) { toast('❌ Member not found', 'error'); return; }
    try {
        await db.ref('users/' + firebaseUser.uid).update({ avatar: memberInfo.avatar });
        await syncPublicProfile(currentUser.memberName, { avatar: memberInfo.avatar });
        currentUser.avatar = memberInfo.avatar;
        $('editAvatarUrl').value = memberInfo.avatar; $('editAvatarFile').value = '';
        updateProfileHeader(); updateAuthUI();
        toast('💬 Discord avatar set!', 'success');
    } catch (err) { toast('❌ ' + err.message, 'error'); }
});

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function renderFramesGrid() {
    const grid = $('framesGrid'); if (!grid) return;
    const userAvatar = currentUser?.avatar || defaultAvatar(currentUser?.nickname || 'U');
    grid.innerHTML = framesData.map(f => `
        <div class="frame-option ${f === previewFrame ? 'selected' : ''}" data-frame="${f}">
            <div class="avatar-wrapper" data-frame="${f}" data-anim="none"><img src="${userAvatar}" alt=""></div>
            <span>${f}</span>
        </div>`).join('');
    grid.querySelectorAll('.frame-option').forEach(opt => opt.addEventListener('click', () => {
        previewFrame = opt.dataset.frame;
        grid.querySelectorAll('.frame-option').forEach(o => o.classList.toggle('selected', o.dataset.frame === previewFrame));
        $('profileAvatarWrapper').dataset.frame = previewFrame;
    }));
}
function renderAnimationsGrid() {
    const grid = $('animationsGrid'); if (!grid) return;
    grid.innerHTML = animationsData.map(a => `
        <div class="anim-option ${a === previewAnim ? 'selected' : ''}" data-anim="${a}"><span>${a}</span></div>`).join('');
    grid.querySelectorAll('.anim-option').forEach(opt => opt.addEventListener('click', () => {
        previewAnim = opt.dataset.anim;
        grid.querySelectorAll('.anim-option').forEach(o => o.classList.toggle('selected', o.dataset.anim === previewAnim));
        $('profileAvatarWrapper').dataset.anim = previewAnim;
    }));
}

$('saveFrameBtn')?.addEventListener('click', async () => {
    if (!currentUser || !firebaseUser) return;
    try {
        await db.ref('users/' + firebaseUser.uid).update({ frame: previewFrame, frameAnimation: previewAnim });
        await syncPublicProfile(currentUser.memberName, { frame: previewFrame, frameAnimation: previewAnim });
        currentUser.frame = previewFrame; currentUser.frameAnimation = previewAnim;
        updateAuthUI();
        toast('✨ Frame saved!', 'success');
    } catch (err) { toast('❌ ' + err.message, 'error'); }
});

$('logoutBtn')?.addEventListener('click', async () => {
    if (firebaseUser) {
        await db.ref('users/' + firebaseUser.uid + '/music/playing').set(false).catch(() => {});
        await db.ref('nowPlaying/' + firebaseUser.uid).remove().catch(() => {});
    }
    await auth.signOut();
    closeProfileModal();
    stopMusicSilent();
    toast('👋 Signed out');
});

/* ============ ADMIN PANEL ============ */
async function loadAdminUsers() {
    const list = $('adminUsersList'); if (!list) return;
    try {
        const snap = await db.ref('users').once('value');
        const users = snap.val() || {};
        const entries = Object.entries(users);
        if (!entries.length) { list.innerHTML = '<p class="dim">No users yet.</p>'; return; }
        list.innerHTML = entries.map(([uid, u]) => `
            <div class="admin-user">
                <div class="avatar-wrapper" data-frame="${u.frame || 'gold'}" data-anim="none"><img src="${u.avatar || defaultAvatar(u.nickname)}" alt=""></div>
                <div class="admin-user-info">
                    <div class="name">${u.nickname || '—'} ${u.role === 'admin' ? '👑' : ''}</div>
                    <div class="email">${u.email || ''}</div>
                    <div class="meta">Member: ${u.memberName || '—'} • ${u.role}</div>
                </div>
                ${u.role === 'admin' ? '' : `<button class="admin-action-btn" data-uid="${uid}" data-member="${u.memberName}">Release Slot</button>`}
            </div>`).join('');
        list.querySelectorAll('.admin-action-btn').forEach(btn => btn.addEventListener('click', async () => {
            if (!confirm('Release slot?')) return;
            try {
                await db.ref('memberSlots/' + btn.dataset.member).remove();
                await db.ref('users/' + btn.dataset.uid).remove();
                await db.ref('publicProfiles/' + btn.dataset.member).remove().catch(() => {});
                await db.ref('nowPlaying/' + btn.dataset.uid).remove().catch(() => {});
                toast('🔄 Released', 'success'); loadAdminUsers();
            } catch (err) { toast('❌ ' + err.message, 'error'); }
        }));
    } catch (err) { list.innerHTML = '<p class="auth-error">' + err.message + '</p>'; }
}

$('resetAllSlotsBtn')?.addEventListener('click', async () => {
    if (!confirm('Reset ALL slots?')) return;
    try {
        for (const m of MEMBERS) { if (m.name === 'KEROSENE') continue; await db.ref('memberSlots/' + m.name).remove(); }
        toast('🔄 Slots reset', 'success'); loadAdminUsers();
    } catch (err) { toast('❌ ' + err.message, 'error'); }
});

$('setRecommendationBtn')?.addEventListener('click', async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    const gameId = parseInt($('recommendGameSelect').value);
    if (!gameId) { toast('⚠️ აირჩიე თამაში', 'error'); return; }
    const g = gamesData.find(x => x.id === gameId); if (!g) return;
    try {
        await db.ref('recommendation').set({ gameId: g.id, gameTitle: g.title, recommendedBy: currentUser.nickname || 'Admin', timestamp: Date.now() });
        toast('👑 Set: ' + g.title, 'success');
    } catch (err) { toast('❌ ' + err.message, 'error'); }
});
$('clearRecommendationBtn')?.addEventListener('click', async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    if (!confirm('Clear Admin\'s Pick?')) return;
    try { await db.ref('recommendation').remove(); toast('🗑 Cleared', 'success'); }
    catch (err) { toast('❌ ' + err.message, 'error'); }
});

/* ============ MUSIC PLAYER ============ */
function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) { initYTPlayer(); return; }
    if (ytApiLoading) return;
    ytApiLoading = true;
    window.onYouTubeIframeAPIReady = initYTPlayer;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
}
function initYTPlayer() {
    ytPlayer = new YT.Player('yt-player', {
        height: '113', width: '200', videoId: '',
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, playsinline: 1, rel: 0 },
        events: {
            onReady: () => { ytPlayerReady = true; updateMusicUI(); },
            onStateChange: (e) => {
                updateMusicUI();
                if (e.data === YT.PlayerState.ENDED) { setNowPlaying({ playing: false }); playNextInPlaylist(); }
            },
            onError: (e) => console.error('YT error:', e.data)
        }
    });
}
function extractYtId(url) {
    if (!url) return null;
    const patterns = [/(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/, /^([a-zA-Z0-9_-]{11})$/];
    for (const p of patterns) { const m = url.trim().match(p); if (m) return m[1]; }
    return null;
}
async function fetchYtTitle(videoId) {
    try {
        const res = await fetch(`https://www.youtube.com/oembed?url=https%3A//www.youtube.com/watch%3Fv%3D${videoId}&format=json`);
        if (!res.ok) throw new Error('fail');
        return (await res.json()).title || '🎵 Track';
    } catch { return '🎵 Track'; }
}

function listenPlaylist() {
    if (!firebaseUser) return;
    db.ref('users/' + firebaseUser.uid + '/playlist').on('value', snap => {
        playlist = snap.val() || {};
        renderPlaylist();
    });
}
function renderPlaylist() {
    const list = $('playlistList'), countEl = $('playlistCount');
    if (!list) return;
    const entries = Object.entries(playlist);
    if (countEl) countEl.textContent = entries.length;
    if (!entries.length) { list.innerHTML = '<div class="playlist-empty">ჯერ არაფერია შენახული — დაამატე ლინკი ⬆️</div>'; return; }
    entries.sort((a, b) => (b[1].addedAt || 0) - (a[1].addedAt || 0));
    list.innerHTML = entries.map(([vid, data], idx) => {
        const isActive = currentMusic?.videoId === vid;
        return `
            <div class="playlist-item ${isActive ? 'active' : ''}" data-vid="${vid}">
                <span class="playlist-item-num">${isActive ? '▶' : (idx + 1)}</span>
                <div class="playlist-item-info">
                    <div class="playlist-item-title">${escapeHtml(data.title || 'Track')}</div>
                    <div class="playlist-item-meta">${data.addedAt ? new Date(data.addedAt).toLocaleDateString() : ''}</div>
                </div>
                <div class="playlist-item-actions">
                    <button class="playlist-btn play-btn" data-action="play" data-vid="${vid}">▶</button>
                    <button class="playlist-btn delete-btn" data-action="delete" data-vid="${vid}">🗑</button>
                </div>
            </div>`;
    }).join('');
    list.querySelectorAll('.playlist-btn').forEach(btn => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (btn.dataset.action === 'play') playFromPlaylist(btn.dataset.vid);
        else deleteFromPlaylist(btn.dataset.vid);
    }));
    list.querySelectorAll('.playlist-item').forEach(item => item.addEventListener('click', (e) => {
        if (e.target.closest('.playlist-btn')) return;
        playFromPlaylist(item.dataset.vid);
    }));
}
async function addToPlaylist() {
    if (!firebaseUser) { toast('⚠️ შედი ანგარიშზე', 'error'); return; }
    const url = $('ytLinkInput').value.trim();
    if (!url) { toast('⚠️ ჩაწერე ლინკი', 'error'); return; }
    const videoId = extractYtId(url);
    if (!videoId) { toast('❌ არასწორი ლინკი', 'error'); return; }
    if (playlist[videoId]) { toast('ℹ️ უკვე არის', 'error'); playFromPlaylist(videoId); return; }
    toast('⏳ ემატება...');
    const title = await fetchYtTitle(videoId);
    try {
        await db.ref('users/' + firebaseUser.uid + '/playlist/' + videoId).set({ title, addedAt: Date.now() });
        $('ytLinkInput').value = '';
        toast('➕ ' + title, 'success');
        playFromPlaylist(videoId);
    } catch (err) { toast('❌ ' + err.message, 'error'); }
}
async function deleteFromPlaylist(videoId) {
    if (!firebaseUser) return;
    if (!confirm('წაიშალოს?')) return;
    try {
        await db.ref('users/' + firebaseUser.uid + '/playlist/' + videoId).remove();
        toast('🗑 წაიშალა', 'success');
        if (currentMusic?.videoId === videoId) stopMusic();
    } catch (err) { toast('❌ ' + err.message, 'error'); }
}
async function playFromPlaylist(videoId) {
    if (!firebaseUser || !currentUser) return;
    if (!ytPlayerReady) { toast('⏳ მოთამაშე იტვირთება...', 'error'); return; }
    const data = playlist[videoId]; if (!data) return;
    try {
        ytPlayer.loadVideoById(videoId);
        currentMusic = { videoId, title: data.title };
        await db.ref('users/' + firebaseUser.uid + '/music').set({ videoId, title: data.title, playing: true, updatedAt: Date.now() });
        await setNowPlaying({ videoId, title: data.title, playing: true });
        updateMusicUI(); renderPlaylist();
        toast('🎵 ' + data.title, 'success');
    } catch (err) { toast('❌ ' + err.message, 'error'); }
}
function playNextInPlaylist() {
    const entries = Object.entries(playlist); if (!entries.length) return;
    entries.sort((a, b) => (a[1].addedAt || 0) - (b[1].addedAt || 0));
    if (!currentMusic) { playFromPlaylist(entries[0][0]); return; }
    const idx = entries.findIndex(([vid]) => vid === currentMusic.videoId);
    if (idx >= 0 && idx < entries.length - 1) playFromPlaylist(entries[idx + 1][0]);
}
async function stopMusic() {
    if (ytPlayer && ytPlayerReady) { try { ytPlayer.stopVideo(); } catch {} }
    await setNowPlaying({ playing: false });
    currentMusic = null;
    updateMusicUI(); renderPlaylist();
    toast('⏹ Music stopped');
}
function stopMusicSilent() {
    if (ytPlayer && ytPlayerReady) { try { ytPlayer.stopVideo(); } catch {} }
    currentMusic = null;
}
function updateMusicUI() {
    const btn = $('musicBtn'), status = $('musicStatus'), name = $('musicName'), disc = $('musicDisc');
    const isPlaying = !!(currentMusic && ytPlayer && ytPlayerReady && ytPlayer.getPlayerState && ytPlayer.getPlayerState() === 1);
    if (btn) btn.classList.toggle('playing', isPlaying);
    if (status) status.textContent = currentMusic ? (isPlaying ? 'Now Playing' : 'Paused / Ready') : 'No Track';
    if (name) name.textContent = currentMusic?.title || 'აირჩიე სიმღერა ან ჩასვი ლინკი';
    if (disc) disc.classList.toggle('spinning', isPlaying);
}
function openMusicModal() { $('musicModal').classList.add('active'); renderPlaylist(); updateMusicUI(); }
function closeMusicModal() { $('musicModal').classList.remove('active'); }

/* ============ GAMES RENDERING ============ */
const gamesGrid = $('gamesGrid'), categoriesGrid = $('categoriesGrid'), gamesHeading = $('gamesHeading');
const filterIndicator = $('filterIndicator'), filterLabel = $('filterLabel');
const clearFilterBtn = $('clearFilterBtn'), resetFilterBtn = $('resetFilterBtn'), comingSoonGrid = $('comingSoonGrid');

function createGameCard(game) {
    return `
        <div class="game-card" data-id="${game.id}">
            <div class="game-card-image">
                <img class="img-bg" src="${game.image}" alt="${game.title}" onerror="this.src='https://picsum.photos/seed/${game.id}/400/250'">
                <div class="overlay"></div>
                <span class="game-badge">${game.badge}</span>
            </div>
            <div class="game-card-body">
                <span class="genre">${game.genre}</span>
                <h3>${game.title}</h3>
                <p class="desc">${game.desc}</p>
                <div class="meta">
                    <span>⭐ <span class="rating">${game.rating}</span></span>
                    <span>📥 ${game.downloads}</span>
                </div>
                <a href="${game.link}" target="_blank" rel="noopener" class="btn-download">⬇️ Download</a>
            </div>
        </div>`;
}
function createComingSoonCard() {
    return `
        <div class="placeholder-card">
            <div class="placeholder-image">
                <img class="img-bg" src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=350&fit=crop" alt="Coming Soon">
                <div class="overlay"></div><span class="placeholder-badge">🔒 Locked</span>
            </div>
            <div class="placeholder-body"><span class="lock-icon">❓</span><div class="coming-soon-text">New Games Coming Soon</div></div>
        </div>`;
}
function createCategoryCard(cat) {
    return `<div class="category-card" data-category="${cat.name}"><span class="cat-icon">${cat.icon}</span><h4>${cat.name}</h4></div>`;
}
function renderCategories() { if (categoriesGrid) categoriesGrid.innerHTML = categoriesData.map(createCategoryCard).join(''); }

function renderGames(filter = null) {
    const filtered = filter ? gamesData.filter(g => g.category === filter) : gamesData;
    gamesGrid.innerHTML = filtered.map(createGameCard).join('');
    gamesGrid.querySelectorAll('.game-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.07}s`;
        card.addEventListener('click', (e) => { if (e.target.closest('.btn-download')) return; openGameModal(parseInt(card.dataset.id)); });
    });
    if (filter) {
        gamesHeading.textContent = `${filter} (${filtered.length})`;
        filterLabel.textContent = `Showing: ${filter}`;
        filterIndicator.style.display = 'inline-flex'; resetFilterBtn.style.display = 'inline-block';
    } else {
        gamesHeading.textContent = 'All Games';
        filterIndicator.style.display = 'none'; resetFilterBtn.style.display = 'none';
    }
    document.querySelectorAll('.category-card').forEach(card => card.classList.toggle('active', card.getAttribute('data-category') === filter));
}
function renderComingSoon() { let h = ''; for (let i = 0; i < 3; i++) h += createComingSoonCard(); comingSoonGrid.innerHTML = h; }
function setFilter(c) { if (currentFilter === c) clearFilter(); else { currentFilter = c; renderGames(c); } }
function clearFilter() { currentFilter = null; renderGames(null); }

categoriesGrid?.addEventListener('click', (e) => { const c = e.target.closest('.category-card'); if (c) setFilter(c.getAttribute('data-category')); });
clearFilterBtn?.addEventListener('click', clearFilter);
resetFilterBtn?.addEventListener('click', clearFilter);

/* ============ GAME MODAL ============ */
function openGameModal(id) {
    const g = gamesData.find(x => x.id === id); if (!g) return;
    const similar = gamesData.filter(x => x.category === g.category && x.id !== id).slice(0, 4);
    const screenshots = [g.image, `https://picsum.photos/seed/${g.id}a/400/220`, `https://picsum.photos/seed/${g.id}b/400/220`];
    $('gameModal').classList.add('active');
    $('modalContent').innerHTML = `
        <button class="modal-close" onclick="closeGameModal()">✕</button>
        <div class="modal-hero">
            <img src="${g.image}" alt="${g.title}" onerror="this.src='https://picsum.photos/seed/${g.id}/800/400'">
            <div class="modal-hero-title"><div class="genre">${g.genre}</div><h2>${g.title}</h2></div>
        </div>
        <div class="modal-body">
            <div class="modal-stats">
                <div class="modal-stat"><span class="lbl">Rating</span><span class="val">⭐ ${g.rating}</span></div>
                <div class="modal-stat"><span class="lbl">Downloads</span><span class="val">📥 ${g.downloads}</span></div>
                <div class="modal-stat"><span class="lbl">Category</span><span class="val" style="text-transform:capitalize;">${g.category}</span></div>
                <div class="modal-stat"><span class="lbl">Badge</span><span class="val">${g.badge}</span></div>
            </div>
            <div class="modal-section"><h4>📖 About</h4><p>${g.desc}</p></div>
            <div class="modal-section"><h4>📸 Screenshots</h4>
                <div class="screenshots">${screenshots.map(s => `<img src="${s}" onclick="window.open('${s}')" onerror="this.style.display='none'">`).join('')}</div>
            </div>
            <div class="modal-section"><h4>💻 System Requirements</h4>
                <div class="sysreq-grid">
                    <div class="sysreq-box"><div class="title">Minimum</div><ul><li>OS: Windows 10 64-bit</li><li>CPU: Intel i5 / Ryzen 5</li><li>RAM: 8 GB</li><li>GPU: GTX 1050 / RX 560</li><li>Storage: 30 GB</li></ul></div>
                    <div class="sysreq-box"><div class="title">Recommended</div><ul><li>OS: Windows 11 64-bit</li><li>CPU: Intel i7 / Ryzen 7</li><li>RAM: 16 GB</li><li>GPU: RTX 3060 / RX 6600</li><li>Storage: 30 GB SSD</li></ul></div>
                </div>
            </div>
            ${similar.length ? `<div class="modal-section"><h4>🎯 Similar Games</h4>
                <div class="similar-games">${similar.map(s => `<div class="similar-game" onclick="openGameModal(${s.id})"><img src="${s.image}" alt="${s.title}"><span>${s.title}</span></div>`).join('')}</div>
            </div>` : ''}
            <a href="${g.link}" target="_blank" rel="noopener" class="btn-download" style="font-size:1.1rem; padding:16px;">⬇️ Download Now</a>
        </div>`;
    document.body.style.overflow = 'hidden';
    saveRecentlyViewed(g.id);
}
function closeGameModal() { $('gameModal').classList.remove('active'); document.body.style.overflow = ''; }
$('gameModal')?.addEventListener('click', (e) => { if (e.target.id === 'gameModal') closeGameModal(); });
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeGameModal(); closeAuthModal(); closeProfileModal(); closeThemeModal(); closeMusicModal(); }
});

/* ============ RECENT ============ */
function saveRecentlyViewed(id) {
    let r = JSON.parse(localStorage.getItem('recentGames') || '[]');
    r = r.filter(x => x !== id); r.unshift(id); r = r.slice(0, 6);
    localStorage.setItem('recentGames', JSON.stringify(r)); renderRecentlyViewed();
}
function renderRecentlyViewed() {
    const recent = JSON.parse(localStorage.getItem('recentGames') || '[]');
    const section = $('recentSection'), list = $('recentList');
    if (!recent.length || !section) return;
    const games = recent.map(id => gamesData.find(g => g.id === id)).filter(Boolean);
    if (!games.length) return;
    list.innerHTML = games.map(g => `<div class="recent-item" onclick="openGameModal(${g.id})"><img src="${g.image}" alt="${g.title}" onerror="this.src='https://picsum.photos/seed/${g.id}/300/150'"><span>${g.title}</span></div>`).join('');
    section.classList.add('visible');
}

/* ============ SEARCH ============ */
$('gameSearch')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) { renderGames(currentFilter); return; }
    const filtered = gamesData.filter(g => g.title.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q));
    gamesGrid.innerHTML = filtered.map(createGameCard).join('');
    gamesGrid.querySelectorAll('.game-card').forEach((c, i) => {
        c.style.animationDelay = `${i * 0.07}s`;
        c.addEventListener('click', (e) => { if (e.target.closest('.btn-download')) return; openGameModal(parseInt(c.dataset.id)); });
    });
    gamesHeading.textContent = `Search: "${q}" (${filtered.length})`;
});

/* ============ LIVE STATS ============ */
function animateNumber(el, target, duration = 1500) {
    const start = 0, startTime = performance.now();
    function tick(now) {
        const p = Math.min((now - startTime) / duration, 1);
        el.textContent = Math.floor(start + (target - start) * p).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}
function initLiveStats() {
    animateNumber($('statPlayers'), 300 + Math.floor(Math.random() * 700));
    animateNumber($('statGames'), gamesData.length);
    animateNumber($('statDownloads'), 2500000 + Math.floor(Math.random() * 500000));
    setInterval(() => {
        const el = $('statPlayers'); if (!el) return;
        const cur = parseInt(el.textContent.replace(/,/g, '')) || 0;
        el.textContent = Math.max(200, cur + Math.floor(Math.random() * 20 - 10)).toLocaleString();
    }, 3000);
}

/* ============ MOBILE MENU ============ */
const hamburger = $('hamburger'), mobileMenu = $('mobileMenu'), mobileOverlay = $('mobileOverlay');
function toggleMenu() {
    hamburger?.classList.toggle('active'); mobileMenu?.classList.toggle('active'); mobileOverlay?.classList.toggle('active');
    document.body.style.overflow = mobileMenu?.classList.contains('active') ? 'hidden' : '';
}
function closeMenu() {
    hamburger?.classList.remove('active'); mobileMenu?.classList.remove('active'); mobileOverlay?.classList.remove('active');
    document.body.style.overflow = '';
}
mobileOverlay?.addEventListener('click', closeMenu);
document.querySelectorAll('.mobile-menu a').forEach(link => link.addEventListener('click', closeMenu));
window.addEventListener('scroll', () => { $('navbar')?.classList.toggle('scrolled', window.scrollY > 60); });

/* ============ PARTICLES ============ */
const canvas = $('particles-canvas'), ctx = canvas?.getContext('2d');
let particles = [];
function resizeCanvas() { if (!canvas) return; canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.6; this.speedY = (Math.random() - 0.5) * 0.6;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.golden = Math.random() < 0.15;
    }
    update() {
        this.x += this.speedX; this.y += this.speedY;
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        if (this.y > canvas.height + 10) this.y = -10;
        this.opacity = Math.max(0.1, Math.min(0.8, this.opacity + (Math.random() - 0.5) * 0.01));
    }
    draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.golden ? `rgba(240,208,120,${this.opacity})` : `rgba(180,170,200,${this.opacity})`;
        if (this.golden) { ctx.shadowColor = 'rgba(240,208,120,0.7)'; ctx.shadowBlur = 6; }
        ctx.fill(); ctx.shadowBlur = 0;
    }
}
function initParticles(count) { particles = Array.from({ length: count }, () => new Particle()); }
function animateParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 100) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(200,170,130,${(1 - Math.sqrt(dx * dx + dy * dy) / 100) * 0.15})`;
            ctx.lineWidth = 0.5; ctx.stroke();
        }
    }
    requestAnimationFrame(animateParticles);
}

/* ============ SMOOTH SCROLL ============ */
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', function (e) {
    const href = this.getAttribute('href'); if (href === '#') return;
    const target = document.querySelector(href);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
}));

/* ============ EVENT LISTENERS ============ */
$('themeBtn')?.addEventListener('click', openThemeModal);
$('musicBtn')?.addEventListener('click', openMusicModal);
$('authBtn')?.addEventListener('click', () => openAuthModal('login'));
$('profileNavBtn')?.addEventListener('click', openProfileModal);
$('addToPlaylistBtn')?.addEventListener('click', addToPlaylist);
$('ytLinkInput')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addToPlaylist(); } });
$('stopMusicBtn')?.addEventListener('click', stopMusic);
$('authModal')?.addEventListener('click', (e) => { if (e.target.id === 'authModal') closeAuthModal(); });
$('profileModal')?.addEventListener('click', (e) => { if (e.target.id === 'profileModal') closeProfileModal(); });
$('themeModal')?.addEventListener('click', (e) => { if (e.target.id === 'themeModal') closeThemeModal(); });
$('musicModal')?.addEventListener('click', (e) => { if (e.target.id === 'musicModal') closeMusicModal(); });

/* ============ INIT ============ */
(function init() {
    initTheme(); renderThemes(); renderCategories(); renderGames(); renderComingSoon();
    renderRecentlyViewed(); initLiveStats();
    listenMemberSlots(); listenPublicProfiles(); listenNowPlaying(); listenRecommendation();
    updateAuthUI(); renderPlaylist(); loadYouTubeAPI();
    if (canvas) {
        resizeCanvas(); window.addEventListener('resize', resizeCanvas);
        initParticles(window.innerWidth < 600 ? 40 : 80);
        window.addEventListener('resize', () => initParticles(window.innerWidth < 600 ? 40 : 80));
        animateParticles();
    }
})();