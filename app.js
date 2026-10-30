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
const FB = 'linear-gradient(135deg,#374151,#8a6a00)';
const img = t => `background-image:${t.image ? `url('${esc(t.image)}'),` : ''}${FB}`;
const himg = t => `background-image:linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.8)),${t.image ? `url('${esc(t.image)}'),` : ''}${FB}`;
const list = a => (a || []).map(x => `<li>${esc(x)}</li>`).join('');

function card(t) {
  const off = t.oldPrice > t.price ? t.oldPrice - t.price : 0;
  return `<article class="card"><a class="img" href="trip.html?id=${esc(t.id)}" style="${img(t)}"><span class="tag">${esc(t.category)}</span>${off ? `<span class="off">${inr(off)} OFF</span>` : ''}</a>
  <div class="cb"><h3>${esc(t.title)}</h3><p class="m">📍 ${esc(t.location)}</p>
  <p class="meta">🗓️ ${esc(t.nights)}N / ${esc(t.days)}D &nbsp; ⛰️ ${esc(t.difficulty)} &nbsp; 💺 ${esc(t.seats)} seats left</p>
  ${t.batch ? `<p class="m">Next batch: ${esc(t.batch)}</p>` : ''}
  <div class="row"><div><small>Starting</small><div class="price">${inr(t.price)} ${off ? `<s>${inr(t.oldPrice)}</s>` : ''}</div></div>
  <div><a class="btn o" href="trip.html?id=${esc(t.id)}">View</a> <button class="btn y" data-enq="${esc(t.title)}">Enquire</button></div></div>${off ? `<p class="sv">Save ${inr(off)} (${Math.round(off / t.oldPrice * 100)}% off)</p>` : ''}</div></article>`;
}

// ---- shared: menu, enquiry modal, floating buttons ----
function shell() {
  if (C.heroImage) document.documentElement.style.setProperty('--hero', `url('${C.heroImage}')`);
  document.querySelectorAll('[data-wa]').forEach(a => a.href = wa(`Hi ${C.name}, mujhe trip ki details chahiye.`));
  $('#menuBtn')?.addEventListener('click', () => $('#nav').classList.toggle('open'));
  document.body.insertAdjacentHTML('beforeend', `<a id="fab" target="_blank" aria-label="WhatsApp" href="${wa('Hi, mujhe trip ki details chahiye.')}">💬</a><div id="modal" hidden><form id="ef"><button type="button" id="mx" class="x">✕</button><h3>Request callback</h3>
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
  let trips = await load('trips', C.demo), cat = new URLSearchParams(location.search).get('cat') || '';
  trips = trips.filter(t => t.active !== false);
  $('#cats').innerHTML = C.categories.map(([n, i]) => `<button class="cat" data-c="${esc(n)}"><span>${i}</span>${esc(n)}</button>`).join('');
  const draw = () => {
    const q = $('#q').value.toLowerCase();
    const r = trips.filter(t => (!cat || t.category === cat) && (t.title + t.location).toLowerCase().includes(q));
    $('#trips').innerHTML = r.length ? r.map(card).join('') : '<p class="m">Koi trip nahi mili. WhatsApp par puchho, hum custom package bana denge.</p>';
  };
  $('#cats').onclick = e => { const b = e.target.closest('.cat'); if (!b) return; if (!$('#sf').closest('.hero') || $('#rv')) { location.href = 'trips.html?cat=' + encodeURIComponent(b.dataset.c); return; } cat = cat === b.dataset.c ? '' : b.dataset.c;
    document.querySelectorAll('.cat').forEach(x => x.classList.toggle('on', x.dataset.c === cat)); draw(); $('#trips').scrollIntoView({behavior: 'smooth'}); };
  $('#sf').onsubmit = e => { e.preventDefault(); if ($('#rv')) { location.href = 'trips.html?q=' + encodeURIComponent($('#q').value); return; } draw(); $('#trips').scrollIntoView({behavior: 'smooth'}); };
  document.querySelectorAll('.cat').forEach(x => x.classList.toggle('on', x.dataset.c === cat));
  if ($('#rv')) {
    $('#trips').innerHTML = trips.slice(0, 6).map(card).join('');
    [['s-wk', 'Weekend Getaways'], ['s-tk', 'Himalayan Treks']].forEach(([id, c]) => { const r = trips.filter(t => t.category === c).slice(0, 4); $('#' + id).innerHTML = r.map(card).join(''); $('#' + id).closest('section').hidden = !r.length; });
  } else { const q0 = new URLSearchParams(location.search).get('q'); if (q0) $('#q').value = q0; draw(); }
  if (!$('#rvl')) return;
  const rv = await load('reviews', C.reviews || []);
  $('#rvl').innerHTML = rv.length ? rv.map(r => `<div class="rev"><div class="st">${'★'.repeat(r.rating || 5)}</div><p>“${esc(r.text)}”</p><b>${esc(r.name)}</b><div class="m">${esc(r.trip)}</div></div>`).join('') : '<p class="m">Abhi koi review nahi. Pehla review aap likho!</p>';
}

// ---- trip detail ----
async function trip() {
  const id = new URLSearchParams(location.search).get('id'); let t = null;
  if (db) { try { const d = await db.collection('trips').doc(id).get(); if (d.exists) t = {id: d.id, ...d.data()}; } catch (e) {} }
  t = t || C.demo.find(x => x.id === id);
  if (!t) { $('#t').innerHTML = '<p class="m" style="padding:40px 20px">Trip nahi mili. <a href="index.html">Home par jao</a></p>'; return; }
  document.title = t.title + ' | ' + C.name;
  $('#t').innerHTML = `<div class="thero" style="${himg(t)}"><div><span class="tag y">${esc(t.category)}</span><h1>${esc(t.title)}</h1><p>📍 ${esc(t.location)}</p></div></div>
  <div class="wrap"><div class="facts"><div><small>Duration</small><b>${esc(t.nights)}N / ${esc(t.days)}D</b></div><div><small>Difficulty</small><b>${esc(t.difficulty)}</b></div><div><small>Starting</small><b>${inr(t.price)}</b></div><div><small>Seats left</small><b>${esc(t.seats)}</b></div>${t.batch ? `<div><small>Next batch</small><b>${esc(t.batch)}</b></div>` : ''}</div>
  <h2>Overview</h2><p>${esc(t.overview)}</p>
  ${t.highlights?.length ? `<h2>Highlights</h2><ul class="ck">${list(t.highlights)}</ul>` : ''}
  ${t.itinerary?.length ? `<h2>Day-wise Itinerary</h2>${t.itinerary.map(d => `<div class="day"><h4>${esc(d.title)}</h4><p>${esc(d.details)}</p></div>`).join('')}` : ''}
  ${t.inclusions?.length ? `<h2>Inclusions</h2><ul class="ck">${list(t.inclusions)}</ul>` : ''}
  ${t.exclusions?.length ? `<h2>Exclusions</h2><ul class="ck no">${list(t.exclusions)}</ul>` : ''}
  ${t.carry?.length ? `<h2>Things to Carry</h2><ul class="pl">${list(t.carry)}</ul>` : ''}
  <button class="btn y big" data-enq="${esc(t.title)}">Enquire about this trip</button></div>`;
}

function custom() {
  $('#cf').onsubmit = async e => { e.preventDefault(); const g = i => $('#' + i)?.value || '';
    const d = {name: g('cn'), phone: g('cp'), trip: ($('#cf').dataset.kind || 'Custom') + ': ' + g('cd'), message: [g('cg') && 'Travellers: ' + g('cg'), g('cb') && 'Budget: ' + g('cb'), g('cdt') && 'Dates: ' + g('cdt')].filter(Boolean).join(', ') + ' ' + g('cm'), createdAt: Date.now()};
    try { if (db) await db.collection('enquiries').add(d); } catch (x) {}
    window.open(wa(`Hi, ${d.trip}. ${d.name} (${d.phone}). ${d.trip}. ${d.message}`), '_blank');
    $('#cok').textContent = 'Request bhej di gayi. Hum jaldi contact karenge.'; e.target.reset(); };
}
async function stories() {
  const rv = await load('reviews', C.reviews || []), gl = db ? await load('gallery', []) : [];
  $('#rvl').innerHTML = rv.length ? rv.map(r => `<div class="rev"><div class="st">${'★'.repeat(r.rating || 5)}</div><p>“${esc(r.text)}”</p><b>${esc(r.name)}</b><div class="m">${esc(r.trip)}</div></div>`).join('') : '<p class="m">Abhi koi review nahi. Pehla review aap likho!</p>';
  $('#gl').innerHTML = gl.length ? gl.map(g => `<figure><div class="gi" style="background-image:url('${esc(g.image)}')"></div><figcaption class="m">${esc(g.caption)}</figcaption></figure>`).join('') : '<p class="m">Photos jaldi aa rahi hain.</p>';
  $('#wr').onsubmit = async e => { e.preventDefault();
    try { await db.collection('reviewRequests').add({name: $('#wn').value, trip: $('#wt').value, text: $('#wx').value, rating: Number($('#ws').value), createdAt: Date.now()}); $('#wok').textContent = 'Shukriya! Review approval ke baad dikhega.'; e.target.reset(); }
    catch (x) { $('#wok').textContent = 'Review abhi nahi bhej paye. Thodi der baad try karo.'; } };
}
document.addEventListener('DOMContentLoaded', () => { shell(); $('#trips') ? home() : $('#t') ? trip() : $('#cf') ? custom() : $('#wr') && stories(); });
  
