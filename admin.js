const C = window.SITE, $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
firebase.initializeApp(C.firebase);
const auth = firebase.auth(), db = firebase.firestore();
let editId = null, cache = {};

auth.onAuthStateChanged(u => { $('#login').hidden = !!u; $('#app').hidden = !u; if (u) show('trips'); });
$('#lf').onsubmit = async e => { e.preventDefault(); try { await auth.signInWithEmailAndPassword($('#em').value, $('#pw').value); } catch (x) { $('#err').textContent = 'Login fail: email ya password galat hai.'; } };
$('#out').onclick = () => auth.signOut();
document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => show(b.dataset.tab));
function show(t) { ['trips','enq','rev'].forEach(x => $('#p-' + x).hidden = x !== t); ({trips: loadTrips, enq: loadEnq, rev: loadRev})[t](); }

// ---- trips ----
const ARR = ['highlights','itinerary','inclusions','exclusions','carry'];
const F = [['title','Title'],['location','Location (e.g. Himachal Pradesh)'],['category','Category','cat'],['days','Days','n'],['nights','Nights','n'],['difficulty','Difficulty','dif'],['price','Price ₹','n'],['oldPrice','Old price ₹ (cut price)','n'],['seats','Seats left','n'],['batch','Next batch (e.g. 20 Nov 2026)'],['image','Image URL'],['overview','Overview','a'],['highlights','Highlights (ek line = ek point)','a'],['itinerary','Itinerary (ek line: Day 1: Title | details)','a'],['inclusions','Inclusions (ek line = ek point)','a'],['exclusions','Exclusions (ek line = ek point)','a'],['carry','Things to carry (ek line = ek point)','a']];
function formHTML(t) {
  return F.map(([k, l, ty]) => {
    let v = t[k] ?? '';
    if (k === 'itinerary') v = (t.itinerary || []).map(d => d.title + ' | ' + d.details).join('\n');
    else if (ARR.includes(k)) v = (t[k] || []).join('\n');
    const id = `f_${k}`;
    const inp = ty === 'a' ? `<textarea id="${id}" rows="${k === 'overview' ? 3 : 4}">${esc(v)}</textarea>`
      : ty === 'cat' ? `<select id="${id}">${C.categories.map(c => `<option ${c[0] === v ? 'selected' : ''}>${esc(c[0])}</option>`).join('')}</select>`
      : ty === 'dif' ? `<select id="${id}">${['Easy','Moderate','Hard'].map(c => `<option ${c === v ? 'selected' : ''}>${c}</option>`).join('')}</select>`
      : `<input id="${id}" ${ty === 'n' ? 'type="number"' : ''} value="${esc(v)}">`;
    return `<label>${l}</label>${inp}`;
  }).join('') + `<label><input type="checkbox" id="f_active" style="width:auto" ${t.active === false ? '' : 'checked'}> Website par dikhao</label><div style="margin-top:14px;display:flex;gap:10px"><button class="btn y">Save trip</button><button type="button" class="btn o" id="cancel">Cancel</button></div>`;
}
function openForm(t, id) { editId = id; $('#tf').innerHTML = formHTML(t || {}); $('#tf').hidden = false; $('#tf').scrollIntoView(); $('#cancel').onclick = () => $('#tf').hidden = true; }
$('#newTrip').onclick = () => openForm({}, null);
$('#tf').onsubmit = async e => {
  e.preventDefault(); const d = {};
  F.forEach(([k,, ty]) => {
    const v = $('#f_' + k).value;
    if (k === 'itinerary') d[k] = v.split('\n').filter(x => x.trim()).map(x => { const [a, ...b] = x.split('|'); return {title: a.trim(), details: b.join('|').trim()}; });
    else if (ARR.includes(k)) d[k] = v.split('\n').map(x => x.trim()).filter(Boolean);
    else d[k] = ty === 'n' ? Number(v || 0) : v.trim();
  });
  d.active = $('#f_active').checked; d.updatedAt = Date.now();
  if (editId) await db.collection('trips').doc(editId).set(d, {merge: true}); else await db.collection('trips').add(d);
  $('#tf').hidden = true; loadTrips();
};
async function loadTrips() {
  const s = await db.collection('trips').get(); cache = {};
  $('#tl').innerHTML = s.empty ? '<p class="m">Abhi koi trip nahi. "+ Add trip" dabao.</p>' : s.docs.map(d => { cache[d.id] = d.data(); const t = d.data();
    return `<div class="item"><div><b>${esc(t.title)}</b><div class="m">${esc(t.category)} · ₹${esc(t.price)} · ${t.active === false ? 'Hidden' : 'Live'}</div></div><div><button class="btn o" data-edit="${d.id}">Edit</button> <button class="btn o" data-del="trips:${d.id}">Delete</button></div></div>`; }).join('');
}
$('#tl').onclick = e => { const b = e.target.closest('[data-edit]'); if (b) openForm(cache[b.dataset.edit], b.dataset.edit); };

// ---- enquiries ----
async function loadEnq() {
  const s = await db.collection('enquiries').orderBy('createdAt', 'desc').get();
  $('#el').innerHTML = s.empty ? '<p class="m">Abhi koi enquiry nahi.</p>' : s.docs.map(d => { const q = d.data();
    return `<div class="item"><div><b>${esc(q.name)}</b> · <a href="tel:${esc(q.phone)}">${esc(q.phone)}</a><div class="m">${esc(q.trip)} ${esc(q.message)}</div><div class="m">${new Date(q.createdAt).toLocaleString('en-IN')}</div></div><button class="btn o" data-del="enquiries:${d.id}">Delete</button></div>`; }).join('');
}

// ---- reviews ----
$('#rf').onsubmit = async e => { e.preventDefault(); await db.collection('reviews').add({name: $('#rn').value, trip: $('#rt').value, text: $('#rx').value, rating: Number($('#rs').value)}); e.target.reset(); loadRev(); };
async function loadRev() {
  const s = await db.collection('reviews').get();
  $('#rl').innerHTML = s.docs.map(d => { const r = d.data(); return `<div class="item"><div><b>${esc(r.name)}</b> ${'★'.repeat(r.rating || 5)}<div class="m">${esc(r.text)}</div></div><button class="btn o" data-del="reviews:${d.id}">Delete</button></div>`; }).join('');
}

// ---- delete (all lists) ----
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-del]'); if (!b || !confirm('Pakka delete karna hai?')) return;
  const [col, id] = b.dataset.del.split(':'); await db.collection(col).doc(id).delete();
  ({trips: loadTrips, enquiries: loadEnq, reviews: loadRev})[col]();
});
