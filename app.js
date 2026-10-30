const C = window.SITE, $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const wa = t => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(t)}`;
let db = null;
if (window.firebase && !C.firebase.apiKey.startsWith('YOUR')) { firebase.initializeApp(C.firebase); db = firebase.firestore(); }

async function load(col, demo) {
  if (!db) return demo;
  try { const s = await db.collection(col).get(); const r = s.docs.map(d => ({id: d.id, ...d.data()})); return r.length ? r : demo; }
  catch (e) { return demo; }
}
const img = t => t.image ? `background-image:url('${esc(t.image)}')` : '';
const list = a => (a || []).map(x => `<li>${esc(x)}</li>`).join('');

function card(t) {
  const off = t.oldPrice > t.price ? t.oldPrice - t.price : 0;
  return `<article class="card"><a class="img" href="trip.html?id=${esc(t.id)}" style="${img(t)}"><span class="tag">${esc(t.category)}</span>${off ? `<span class="off">${inr(off)} OFF</span>` : ''}</a>
  <div class="cb"><h3>${esc(t.title)}</h3><p class="m">📍 ${esc(t.location)}</p>
  <p class="meta">🗓️ ${esc(t.nights)}N / ${esc(t.days)}D &nbsp; ⛰️ ${esc(t.difficulty)} &nbsp; 💺 ${esc(t.seats)} seats left</p>
  ${t.batch ? `<p class="m">Next batch: ${esc(t.batch)}</p>` : ''}
  <div class="row"><div><small>Starting</small><div class="price">${inr(t.price)} ${off ? `<s>${inr(t.oldPrice)}</s>` : ''}</div></div>
  <div><a class="btn o" href="trip.html?id=${esc(t.id)}">View</a> <button class="btn y" data-enq="${esc(t.title)}">Enquire</button></div></div></div></article>`;
}

// ---- shared: menu, enquiry modal, floating buttons ----
function shell() {
  document.querySelectorAll('[data-wa]').forEach(a => a.href = wa(`Hi ${C.name}, mujhe trip ki details chahiye.`));
  $('#menuBtn')?.addEventListener('click', () => $('#nav').classList.toggle('open'));
  document.body.insertAdjacentHTML('beforeend', `<div id="modal" hidden><form id="ef"><button type="button" id="mx" class="x">✕</button><h3>Request callback</h3>
  <input id="en" placeholder="Your name" required><input id="ep" placeholder="Phone number" type="tel" required><input id="et" placeholder="Trip (optional)"><textarea id="em" rows="3" placeholder="Message (optional)"></textarea>
  <button class="btn y" style="width:100%">Send enquiry</button><p id="eok" class="m"></p></form></div>`);
  const open = t => { $('#et').value = t || ''; $('#modal').hidden = false; };
  document.addEventListener('click', e => { const b = e.target.closest('[data-enq]'); if (b) open(b.dataset.enq); });
  $('#mx').onclick = () => $('#modal').hidden = true;
  $('#ef').onsubmit = async e => {
    e.preventDefault();
    const d = {name: $('#en').value, phone: $('#ep').value, trip: $('#et').value, message: $('#em').value, createdAt: Date.now()};
    try { if (db) await db.collection('enquiries').add(d); } catch (x) {}
    window.open(wa(`Hi, main ${d.name} (${d.phone}). Trip: ${d.trip || 'general'}. ${d.message}`), '_blank');
    $('#eok').textContent = 'Enquiry bhej di gayi. Hum jaldi contact karenge.'; e.target.reset();
  };
}

// ---- home ----
async function home() {
  let trips = await load('trips', C.demo), cat = '';
  trips = trips.filter(t => t.active !== false);
  $('#cats').innerHTML = C.categories.map(([n, i]) => `<button class="cat" data-c="${esc(n)}"><span>${i}</span>${esc(n)}</button>`).join('');
  const draw = () => {
    const q = $('#q').value.toLowerCase();
    const r = trips.filter(t => (!cat || t.category === cat) && (t.title + t.location).toLowerCase().includes(q));
    $('#trips').innerHTML = r.length ? r.map(card).join('') : '<p class="m">Koi trip nahi mili. WhatsApp par puchho, hum custom package bana denge.</p>';
  };
  $('#cats').onclick = e => { const b = e.target.closest('.cat'); if (!b) return; cat = cat === b.dataset.c ? '' : b.dataset.c;
    document.querySelectorAll('.cat').forEach(x => x.classList.toggle('on', x.dataset.c === cat)); draw(); $('#trips').scrollIntoView({behavior: 'smooth'}); };
  $('#sf').onsubmit = e => { e.preventDefault(); draw(); $('#trips').scrollIntoView({behavior: 'smooth'}); };
  draw();
  const rv = db ? await load('reviews', []) : [];
  if (rv.length) { $('#rv').hidden = false; $('#rvl').innerHTML = rv.map(r => `<div class="rev"><div class="st">${'★'.repeat(r.rating || 5)}</div><p>“${esc(r.text)}”</p><b>${esc(r.name)}</b><div class="m">${esc(r.trip)}</div></div>`).join(''); }
}

// ---- trip detail ----
async function trip() {
  const id = new URLSearchParams(location.search).get('id'); let t = null;
  if (db) { try { const d = await db.collection('trips').doc(id).get(); if (d.exists) t = {id: d.id, ...d.data()}; } catch (e) {} }
  t = t || C.demo.find(x => x.id === id);
  if (!t) { $('#t').innerHTML = '<p class="m" style="padding:40px 20px">Trip nahi mili. <a href="index.html">Home par jao</a></p>'; return; }
  document.title = t.title + ' | ' + C.name;
  $('#t').innerHTML = `<div class="thero" style="${img(t)}"><div><span class="tag y">${esc(t.category)}</span><h1>${esc(t.title)}</h1><p>📍 ${esc(t.location)}</p></div></div>
  <div class="wrap"><div class="facts"><div><small>Duration</small><b>${esc(t.nights)}N / ${esc(t.days)}D</b></div><div><small>Difficulty</small><b>${esc(t.difficulty)}</b></div><div><small>Starting</small><b>${inr(t.price)}</b></div><div><small>Seats left</small><b>${esc(t.seats)}</b></div>${t.batch ? `<div><small>Next batch</small><b>${esc(t.batch)}</b></div>` : ''}</div>
  <h2>Overview</h2><p>${esc(t.overview)}</p>
  ${t.highlights?.length ? `<h2>Highlights</h2><ul class="ck">${list(t.highlights)}</ul>` : ''}
  ${t.itinerary?.length ? `<h2>Day-wise Itinerary</h2>${t.itinerary.map(d => `<div class="day"><h4>${esc(d.title)}</h4><p>${esc(d.details)}</p></div>`).join('')}` : ''}
  ${t.inclusions?.length ? `<h2>Inclusions</h2><ul class="ck">${list(t.inclusions)}</ul>` : ''}
  ${t.exclusions?.length ? `<h2>Exclusions</h2><ul class="ck no">${list(t.exclusions)}</ul>` : ''}
  ${t.carry?.length ? `<h2>Things to Carry</h2><ul class="pl">${list(t.carry)}</ul>` : ''}
  <button class="btn y big" data-enq="${esc(t.title)}">Enquire about this trip</button></div>`;
}

document.addEventListener('DOMContentLoaded', () => { shell(); $('#trips') ? home() : $('#t') && trip(); });
