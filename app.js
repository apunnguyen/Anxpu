/* ============================================
   💕 KHÔNG GIAN CỦA EM YÊU - APP.JS
   100% Supabase — Không còn localStorage
   ============================================ */

const SUPABASE_URL = "https://ugxfbzsnpmwnwrwaanir.supabase.co";
const SUPABASE_KEY = "sb_publishable_rzp9YtPP-YHNOo95AtY4hA_b1zJIncj";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---- Config ----
const SECTIONS = {
  items:  { label: 'Món đồ yêu thích',    icon: '🛍️', hasPrice: true,  unit: 'món' },
  food:   { label: 'Địa điểm ăn uống',    icon: '🍜', hasPrice: true,  unit: 'nơi' },
  photo:  { label: 'Chỗ chụp hình',       icon: '📸', hasPrice: false, unit: 'nơi' },
  travel: { label: 'Địa điểm du lịch',    icon: '✈️', hasPrice: false, unit: 'nơi' },
  games:  { label: 'Trò chơi muốn chơi',  icon: '🎮', hasPrice: false, unit: 'trò' },
  movies: { label: 'Phim muốn xem',       icon: '🎬', hasPrice: false, unit: 'phim' },
  diary:  { label: 'Tâm sự của em',       icon: '📔', hasPrice: false, unit: 'tâm sự' },
};

let currentSection = null;
let deleteTarget = { id: null, section: null };

// ============================================
// SUPABASE DATA HELPERS
// ============================================

/** Lấy tất cả items của một section từ Supabase */
async function fetchSection(sectionKey) {
  const { data, error } = await db
    .from('entries')
    .select('*')
    .eq('section', sectionKey)
    .order('ts', { ascending: true });

  if (error) {
    console.error('fetchSection error:', error);
    return [];
  }
  return data || [];
}

/** Lấy một item theo id từ Supabase */
async function fetchItemById(id) {
  const { data, error } = await db
    .from('entries')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('fetchItemById error:', error);
    return null;
  }
  return data;
}

// ============================================
// LANDING & LETTER
// ============================================
function initLanding() {
  spawnPetals();
  spawnFloatingHearts();
}

function spawnPetals() {
  const container = document.getElementById('petals');
  const symbols = ['🌸', '🌷', '🌺', '🌹', '💮', '🏵️'];
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.className = 'petal';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (1 + Math.random() * 1.2) + 'rem';
    el.style.animationDuration = (5 + Math.random() * 8) + 's';
    el.style.animationDelay = (Math.random() * 8) + 's';
    container.appendChild(el);
  }
}

function spawnFloatingHearts() {
  const container = document.getElementById('floatingHearts');
  const hearts = ['💕', '💗', '💖', '💝', '❤️', '🩷'];
  for (let i = 0; i < 10; i++) {
    const el = document.createElement('div');
    el.className = 'float-heart';
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    el.style.left = (10 + Math.random() * 80) + 'vw';
    el.style.bottom = (Math.random() * 30) + 'vh';
    el.style.animationDuration = (3 + Math.random() * 4) + 's';
    el.style.animationDelay = (Math.random() * 6) + 's';
    container.appendChild(el);
  }
}

function openLetter() {
  const overlay = document.getElementById('letterOverlay');
  overlay.classList.remove('hidden');
  const env = document.getElementById('envelopeBtn');
  env.style.transform = 'scale(0.9)';
  setTimeout(() => env.style.transform = '', 200);
}

function closeLetter() {
  document.getElementById('letterOverlay').classList.add('hidden');
  const landing = document.getElementById('landing');
  landing.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  landing.style.opacity = '0';
  landing.style.transform = 'scale(1.04)';
  setTimeout(() => {
    landing.classList.add('hidden');
    showMainApp();
  }, 600);
}

function showMainApp() {
  const app = document.getElementById('mainApp');
  app.classList.remove('hidden');
  app.style.opacity = '0';
  requestAnimationFrame(() => {
    app.style.transition = 'opacity 0.5s ease';
    app.style.opacity = '1';
  });
  updateDateDisplay();
  updateAllCounts();
}

function goHome() {
  window.location.reload();
}

// ============================================
// DATE DISPLAY
// ============================================
function updateDateDisplay() {
  const el = document.getElementById('dateDisplay');
  if (!el) return;
  const now = new Date();
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const d = days[now.getDay()];
  const date = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  el.textContent = `${d}, ${date}/${month}/${year}`;
}

// ============================================
// COUNTS — đọc từ Supabase
// ============================================
async function updateAllCounts() {
  for (const key in SECTIONS) {
    const data = await fetchSection(key);
    const el = document.getElementById('count-' + key);
    if (el) {
      el.textContent = data.length + ' ' + SECTIONS[key].unit;
    }
  }
}

// ============================================
// NAVIGATION
// ============================================
async function openSection(key) {
  currentSection = key;
  const cfg = SECTIONS[key];

  document.getElementById('headerEmoji').textContent = cfg.icon;
  document.getElementById('headerTitle').textContent = cfg.label;

  document.getElementById('homeGrid').classList.add('hidden');
  document.getElementById('sectionView').classList.remove('hidden');

  document.getElementById('sectionTitle').textContent = cfg.icon + ' ' + cfg.label;

  if (key === 'diary') {
    document.getElementById('addForm').classList.add('hidden');
    document.getElementById('diaryForm').classList.remove('hidden');
  } else {
    document.getElementById('addForm').classList.remove('hidden');
    document.getElementById('diaryForm').classList.add('hidden');
    document.getElementById('priceRow').style.display = cfg.hasPrice ? '' : 'none';
  }

  await renderList(key);
}

function backToHome() {
  currentSection = null;
  document.getElementById('headerEmoji').textContent = '💗';
  document.getElementById('headerTitle').textContent = 'Không gian của em yêu';
  document.getElementById('homeGrid').classList.remove('hidden');
  document.getElementById('sectionView').classList.add('hidden');
  updateAllCounts();
}

// ============================================
// RENDER LIST — đọc từ Supabase
// ============================================
async function renderList(key) {
  const container = document.getElementById('itemsList');
  container.innerHTML = `<div class="empty-state"><div class="loading-dots">🌸 Đang tải...</div></div>`;

  const data = await fetchSection(key);
  const cfg = SECTIONS[key];

  if (data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${cfg.icon}</div>
        <p>Chưa có gì ở đây cả...<br>Em thêm vào nha! 🌸</p>
      </div>`;
    return;
  }

  container.innerHTML = '';

  if (key === 'diary') {
    // Sort newest first
    const sorted = [...data].sort((a, b) => b.ts - a.ts);
    sorted.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'item-card diary-card-item';
      const displayText = item.diary_text || item.text || '';
      card.innerHTML = `
        <div class="item-num">${sorted.length - idx}</div>
        <div class="item-content">
          <div class="diary-time">🕐 ${formatDateTime(item.ts)}</div>
          <div class="diary-text">${escHtml(displayText)}</div>
        </div>
        <div class="item-actions">
          <button class="del-btn" onclick="askDelete('${item.id}','diary','Tâm sự ngày ${formatDate(item.ts)}')">🗑️ Xoá</button>
        </div>`;
      container.appendChild(card);
    });
  } else {
    data.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'item-card';
      let metaHtml = '';
      if (item.price) {
        metaHtml += `<span class="item-badge badge-price">💰 ${escHtml(item.price)}</span>`;
      }
      if (item.link) {
        metaHtml += `<a class="item-badge badge-link" href="${escHtml(item.link)}" target="_blank" rel="noopener">🔗 Xem link</a>`;
      }
      card.innerHTML = `
        <div class="item-num">${idx + 1}</div>
        <div class="item-content">
          <div class="item-name">${escHtml(item.name)}</div>
          ${metaHtml ? `<div class="item-meta">${metaHtml}</div>` : ''}
          ${item.note ? `<div class="item-note">📝 ${escHtml(item.note)}</div>` : ''}
        </div>
        <div class="item-actions">
          <button class="edit-btn" onclick="openEdit('${item.id}','${key}')">✏️ Sửa</button>
          <button class="del-btn" onclick="askDelete('${item.id}','${key}','${escHtml(item.name)}')">🗑️ Xoá</button>
        </div>`;
      container.appendChild(card);
    });
  }
}

// ============================================
// ADD ITEM — ghi vào Supabase
// ============================================
async function addItem() {
  const name = document.getElementById('fName').value.trim();
  if (!name) {
    showToast('⚠️ Em nhập tên trước nha!');
    return;
  }

  const link  = document.getElementById('fLink').value.trim();
  const price = document.getElementById('fPrice').value.trim();
  const note  = document.getElementById('fNote').value.trim();

  const { error } = await db
    .from('entries')
    .insert([{
      section: currentSection,
      name,
      link:  link  || null,
      price: price || null,
      note:  note  || null,
      ts: Date.now()
    }]);

  if (error) {
    console.error('addItem error:', error);
    showToast('❌ Lỗi khi thêm, em thử lại nha!');
    return;
  }

  document.getElementById('fName').value  = '';
  document.getElementById('fLink').value  = '';
  document.getElementById('fPrice').value = '';
  document.getElementById('fNote').value  = '';

  await renderList(currentSection);
  await updateAllCounts();
  showToast('💕 Đã thêm vào danh sách!');
}

// ============================================
// ADD DIARY — ghi vào Supabase
// ============================================
async function addDiary() {
  const text = document.getElementById('fDiary').value.trim();
  if (!text) {
    showToast('⚠️ Em viết gì đi nha!');
    return;
  }

  const { error } = await db
    .from('entries')
    .insert([{
      section:    'diary',
      name:       'diary',
      diary_text: text,
      ts: Date.now()
    }]);

  if (error) {
    console.error('addDiary error:', error);
    showToast('❌ Lỗi khi lưu, em thử lại nha!');
    return;
  }

  document.getElementById('fDiary').value = '';
  await renderList('diary');
  await updateAllCounts();
  showToast('💌 Đã lưu tâm sự!');
}

// ============================================
// EDIT — mở modal, đọc dữ liệu từ Supabase
// ============================================
async function openEdit(id, sectionKey) {
  const item = await fetchItemById(id);
  if (!item) {
    showToast('❌ Không tìm thấy mục này!');
    return;
  }

  const cfg = SECTIONS[sectionKey];
  document.getElementById('editId').value      = id;
  document.getElementById('editSection').value = sectionKey;
  document.getElementById('editName').value    = item.name  || '';
  document.getElementById('editLink').value    = item.link  || '';
  document.getElementById('editPrice').value   = item.price || '';
  document.getElementById('editNote').value    = item.note  || '';
  document.getElementById('editPriceRow').style.display = cfg.hasPrice ? '' : 'none';

  document.getElementById('editModal').classList.remove('hidden');
}

function closeEdit() {
  document.getElementById('editModal').classList.add('hidden');
}

// saveEdit — cập nhật Supabase
async function saveEdit() {
  const id         = document.getElementById('editId').value;
  const sectionKey = document.getElementById('editSection').value;
  const name       = document.getElementById('editName').value.trim();

  if (!name) {
    showToast('⚠️ Em nhập tên trước nha!');
    return;
  }

  const link  = document.getElementById('editLink').value.trim();
  const price = document.getElementById('editPrice').value.trim();
  const note  = document.getElementById('editNote').value.trim();

  const { error } = await db
    .from('entries')
    .update({
      name,
      link:  link  || null,
      price: price || null,
      note:  note  || null,
    })
    .eq('id', id);

  if (error) {
    console.error('saveEdit error:', error);
    showToast('❌ Lỗi khi lưu, em thử lại nha!');
    return;
  }

  closeEdit();
  await renderList(sectionKey);
  showToast('✅ Đã cập nhật!');
}

// ============================================
// DELETE — xoá khỏi Supabase
// ============================================
function askDelete(id, sectionKey, label) {
  deleteTarget = { id, section: sectionKey };
  document.getElementById('deleteItemName').textContent = '"' + label + '"';
  document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDelete() {
  document.getElementById('deleteModal').classList.add('hidden');
  deleteTarget = { id: null, section: null };
}

async function confirmDelete() {
  const { id, section } = deleteTarget;
  if (!id) return;

  const { error } = await db
    .from('entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('confirmDelete error:', error);
    showToast('❌ Lỗi khi xoá, em thử lại nha!');
    return;
  }

  closeDelete();
  await renderList(section || currentSection);
  await updateAllCounts();
  showToast('🗑️ Đã xoá rồi nha!');
}

// ============================================
// TOAST
// ============================================
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  requestAnimationFrame(() => el.classList.add('show'));
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.classList.add('hidden'), 400);
  }, 2500);
}

// ============================================
// HELPERS
// ============================================
function escHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDateTime(ts) {
  const d = new Date(Number(ts));
  const pad = n => n.toString().padStart(2, '0');
  const days = ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'];
  return `${days[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} lúc ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(ts) {
  const d = new Date(Number(ts));
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!document.getElementById('editModal').classList.contains('hidden'))   closeEdit();
    if (!document.getElementById('deleteModal').classList.contains('hidden')) closeDelete();
    if (!document.getElementById('letterOverlay').classList.contains('hidden')) closeLetter();
  }
  if (e.key === 'Enter' && e.ctrlKey) {
    if (currentSection === 'diary') addDiary();
    else if (currentSection)        addItem();
  }
});

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initLanding();
});
