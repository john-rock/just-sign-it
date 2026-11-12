(() => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const state = {
    bytes: null,       // original PDF bytes
    name: '',
    pdf: null,         // pdf.js document
    pages: [],         // { index, page, vp1, el, canvas, layer }
    zoom: 1,
    sigs: [],          // { id, dataUrl, aspect (h/w) }
    items: [],         // { id, sigId, page, fx, fy, fw, el }
    selected: null,
    renderToken: 0,
  };

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg, ms = 2200) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  }

  // ---------- Signature storage ----------
  // Signatures are only persisted when the user opts in ("Remember my signatures").
  const STORE_KEY = 'pdfsigner.signatures.v1';
  const PREF_KEY = 'pdfsigner.remember';
  let remember = false;
  function loadSigs() {
    let stored = null;
    try {
      stored = JSON.parse(localStorage.getItem(STORE_KEY));
      const pref = localStorage.getItem(PREF_KEY);
      // Earlier versions saved automatically: keep those signatures and treat it as opted in.
      remember = pref === null ? Array.isArray(stored) && stored.length > 0 : pref === '1';
    } catch { remember = false; }
    state.sigs = remember && Array.isArray(stored) ? stored : [];
    $('#rememberSigs').checked = remember;
  }
  function saveSigs() {
    try {
      if (remember) localStorage.setItem(STORE_KEY, JSON.stringify(state.sigs));
      else localStorage.removeItem(STORE_KEY);
    } catch {}
  }
  $('#rememberSigs').addEventListener('change', (e) => {
    remember = e.target.checked;
    try { localStorage.setItem(PREF_KEY, remember ? '1' : '0'); } catch {}
    saveSigs();
    toast(remember ? 'Signatures will be saved on this device' : 'Saved signatures removed from this device');
  });
  const sigById = (id) => state.sigs.find(s => s.id === id);

  function renderSigList() {
    const list = $('#sigList'); list.innerHTML = '';
    state.sigs.forEach(sig => {
      const d = document.createElement('div');
      d.className = 'sig-thumb'; d.draggable = true; d.title = 'Click to place · drag onto a page';
      d.tabIndex = 0; d.setAttribute('role', 'button');
      d.setAttribute('aria-label', 'Place signature on the current page');
      d.innerHTML = `<img alt=""><button class="del" title="Delete signature" aria-label="Delete signature">×</button>`;
      d.querySelector('img').src = sig.dataUrl;
      const del = () => {
        const used = state.items.filter(i => i.sigId === sig.id);
        if (used.length && !confirm('This signature is placed on the PDF. Delete it and remove it from the pages?')) return;
        used.forEach(removeItem);
        state.sigs = state.sigs.filter(s => s.id !== sig.id);
        saveSigs(); renderSigList();
      };
      d.addEventListener('click', (e) => {
        if (e.target.closest('.del')) return;
        placeOnVisiblePage(sig);
      });
      d.addEventListener('keydown', (e) => {
        if (e.target !== d) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); placeOnVisiblePage(sig); }
        else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); del(); }
      });
      d.querySelector('.del').addEventListener('click', (e) => { e.stopPropagation(); del(); });
      d.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('application/x-sig', sig.id);
        e.dataTransfer.effectAllowed = 'copy';
      });
      list.appendChild(d);
    });
    if (!state.sigs.length) {
      list.innerHTML = '<div class="sig-empty">No signatures yet.<br>Draw, type, or upload one to get started.</div>';
    }
    $('#sigHint').style.display = state.sigs.length ? '' : 'none';
  }

  // ---------- Image helpers ----------
  // Crop transparent margins of a canvas; returns {dataUrl, aspect}
  function cropCanvas(src, pad = 6) {
    const ctx = src.getContext('2d');
    const { width: w, height: h } = src;
    const data = ctx.getImageData(0, 0, w, h).data;
    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > 8) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return null;
    minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
    maxX = Math.min(w - 1, maxX + pad); maxY = Math.min(h - 1, maxY + pad);
    const cw = maxX - minX + 1, ch = maxY - minY + 1;
    const out = document.createElement('canvas'); out.width = cw; out.height = ch;
    out.getContext('2d').drawImage(src, minX, minY, cw, ch, 0, 0, cw, ch);
    return { dataUrl: out.toDataURL('image/png'), aspect: ch / cw };
  }

  function loadImage(src) {
    return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  }

  // ---------- Modal: create signature ----------
  let activeTab = 'draw';
  let inkColor = '#111111';
  let uploadedImg = null;
  const FONTS = ['Great Vibes', 'Dancing Script', 'Homemade Apple', 'Caveat'];
  let typeFont = FONTS[0];

  function openModal() {
    $('#modal').classList.add('open');
    setupPad();
    if (activeTab === 'type') setTimeout(() => $('#typeInput').focus(), 0);
  }
  function closeModal() { $('#modal').classList.remove('open'); }

  $$('.tabs button').forEach(b => b.addEventListener('click', () => {
    activeTab = b.dataset.tab;
    $$('.tabs button').forEach(x => x.classList.toggle('active', x === b));
    $$('.tab').forEach(t => t.classList.toggle('active', t.id === 'tab-' + activeTab));
    if (activeTab === 'draw') setupPad();
    if (activeTab === 'type') $('#typeInput').focus();
  }));

  $$('.swatch').forEach(s => s.addEventListener('click', () => {
    inkColor = s.dataset.color;
    $$('.swatch').forEach(x => x.classList.toggle('active', x.dataset.color === inkColor));
    if (padCtx) padCtx.strokeStyle = inkColor;
    renderFontOpts();
  }));

  // Draw pad
  const pad = $('#drawPad');
  let padCtx = null, padHasInk = false;
  function setupPad() {
    const r = pad.getBoundingClientRect();
    if (!r.width) return;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (pad.width === w && pad.height === h && padCtx) return;
    pad.width = w; pad.height = h;
    padCtx = pad.getContext('2d');
    padCtx.scale(dpr, dpr);
    padCtx.lineCap = 'round'; padCtx.lineJoin = 'round';
    padCtx.lineWidth = 2.6; padCtx.strokeStyle = inkColor;
    padHasInk = false;
  }
  function clearPad() {
    if (!padCtx) return;
    padCtx.save(); padCtx.setTransform(1, 0, 0, 1, 0, 0); padCtx.clearRect(0, 0, pad.width, pad.height); padCtx.restore();
    padHasInk = false;
  }
  $('#clearPad').addEventListener('click', clearPad);
  (() => {
    let drawing = false, last = null, mid = null;
    const pt = (e) => { const r = pad.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    pad.addEventListener('pointerdown', (e) => {
      setupPad(); drawing = true; pad.setPointerCapture(e.pointerId);
      last = pt(e); mid = last;
      padCtx.beginPath(); padCtx.arc(last.x, last.y, padCtx.lineWidth / 2, 0, Math.PI * 2);
      padCtx.fillStyle = inkColor; padCtx.fill();
      padHasInk = true;
    });
    pad.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const p = pt(e);
      const m = { x: (last.x + p.x) / 2, y: (last.y + p.y) / 2 };
      padCtx.beginPath(); padCtx.moveTo(mid.x, mid.y); padCtx.quadraticCurveTo(last.x, last.y, m.x, m.y); padCtx.stroke();
      last = p; mid = m;
    });
    const end = () => { drawing = false; };
    pad.addEventListener('pointerup', end); pad.addEventListener('pointercancel', end);
  })();

  // Type
  function renderFontOpts() {
    const wrap = $('#fontOpts'); wrap.innerHTML = '';
    const text = $('#typeInput').value.trim() || 'Your Name';
    FONTS.forEach(f => {
      const b = document.createElement('button');
      b.className = 'font-opt' + (f === typeFont ? ' active' : '');
      b.style.fontFamily = `"${f}", cursive`; b.style.color = inkColor;
      b.textContent = text;
      b.addEventListener('click', () => { typeFont = f; renderFontOpts(); });
      wrap.appendChild(b);
    });
  }
  $('#typeInput').addEventListener('input', renderFontOpts);
  $('#typeInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#saveSig').click(); });
  renderFontOpts();

  async function typedSignature() {
    const text = $('#typeInput').value.trim();
    if (!text) return null;
    const size = 140;
    try { await document.fonts.load(`${size}px "${typeFont}"`, text); } catch {}
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    ctx.font = `${size}px "${typeFont}"`;
    const w = Math.ceil(ctx.measureText(text).width) + size;
    c.width = w; c.height = size * 2;
    ctx.font = `${size}px "${typeFont}"`;
    ctx.fillStyle = inkColor; ctx.textBaseline = 'middle';
    ctx.fillText(text, size / 2, size);
    return cropCanvas(c, 10);
  }

  // Upload
  const uz = $('#uploadZone');
  uz.addEventListener('click', () => $('#imgInput').click());
  $('#imgInput').addEventListener('change', (e) => { if (e.target.files[0]) readImageFile(e.target.files[0]); e.target.value = ''; });
  uz.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); });
  uz.addEventListener('drop', (e) => {
    e.preventDefault(); e.stopPropagation(); document.body.classList.remove('dragging-file');
    const f = e.dataTransfer.files[0]; if (f && f.type.startsWith('image/')) readImageFile(f);
  });
  function readImageFile(file) {
    const r = new FileReader();
    r.onload = async () => {
      uploadedImg = await loadImage(r.result);
      uz.innerHTML = ''; const i = new Image(); i.src = r.result; uz.appendChild(i);
    };
    r.readAsDataURL(file);
  }
  function uploadedSignature() {
    if (!uploadedImg) return null;
    const max = 1600;
    const s = Math.min(1, max / Math.max(uploadedImg.width, uploadedImg.height));
    const c = document.createElement('canvas');
    c.width = Math.round(uploadedImg.width * s); c.height = Math.round(uploadedImg.height * s);
    const ctx = c.getContext('2d');
    ctx.drawImage(uploadedImg, 0, 0, c.width, c.height);
    if ($('#removeBg').checked) {
      const img = ctx.getImageData(0, 0, c.width, c.height); const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        if (lum > 220) d[i + 3] = 0;
        else if (lum > 170) d[i + 3] = Math.round(d[i + 3] * (220 - lum) / 50);
      }
      ctx.putImageData(img, 0, 0);
    }
    return cropCanvas(c, 4);
  }

  $('#newSigBtn').addEventListener('click', openModal);
  $('#cancelSig').addEventListener('click', closeModal);
  $('#modal').addEventListener('pointerdown', (e) => { if (e.target.id === 'modal') closeModal(); });
  $('#saveSig').addEventListener('click', async () => {
    let result = null;
    if (activeTab === 'draw') result = padHasInk ? cropCanvas(pad, 8) : null;
    else if (activeTab === 'type') result = await typedSignature();
    else result = uploadedSignature();
    if (!result) { toast(activeTab === 'draw' ? 'Draw your signature first' : activeTab === 'type' ? 'Type your name first' : 'Choose an image first'); return; }
    const sig = { id: uid(), ...result };
    state.sigs.push(sig); saveSigs(); renderSigList();
    clearPad(); $('#typeInput').value = ''; renderFontOpts();
    uploadedImg = null; uz.textContent = 'Click or drop an image of your signature';
    closeModal();
    if (state.pdf) { placeOnVisiblePage(sig); toast('Placed — drag it where you need it'); }
    else toast('Signature saved — now open a PDF');
  });

  // ---------- PDF loading & rendering ----------
  async function openPdf(file) {
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjsLib.getDocument({ data: buf.slice(), isEvalSupported: false }).promise;
      // Make sure we can actually write to this PDF before the user spends time placing signatures.
      try {
        await PDFLib.PDFDocument.load(buf, { updateMetadata: false });
      } catch (e) {
        pdf.destroy();
        if (/encrypt/i.test(e && e.message)) {
          toast('This PDF is protected and can’t be edited. Remove the protection first (e.g. open it and “Print → Save as PDF”), then try again.', 7000);
        } else {
          toast('Sorry, this PDF can’t be edited by this tool');
        }
        return;
      }
      // reset
      state.items.forEach(i => i.el.remove());
      state.items = []; state.selected = null;
      if (state.pdf) state.pdf.destroy();
      state.bytes = buf; state.name = file.name.replace(/\.pdf$/i, ''); state.pdf = pdf; state.zoom = 1;
      state.pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        state.pages.push({ index: i - 1, page, vp1: page.getViewport({ scale: 1 }) });
      }
      $('#fileName').textContent = file.name;
      $('#empty').style.display = 'none';
      ['#downloadBtn', '#zoomIn', '#zoomOut'].forEach(s => $(s).disabled = false);
      buildPages();
      $('#viewer').scrollTop = 0;
    } catch (err) {
      console.error(err);
      toast(err && err.name === 'PasswordException' ? 'That PDF is password-protected' : 'Could not open that PDF');
    }
  }

  function baseScale() {
    const avail = $('#viewer').clientWidth - 48;
    const maxW = Math.max(...state.pages.map(p => p.vp1.width));
    return Math.min(avail / maxW, 1.6);
  }

  function buildPages() {
    const wrap = $('#pages'); wrap.innerHTML = '';
    state.pages.forEach(p => {
      const el = document.createElement('div'); el.className = 'page';
      const canvas = document.createElement('canvas'); canvas.width = 0; canvas.height = 0;
      const layer = document.createElement('div'); layer.className = 'layer';
      const num = document.createElement('div'); num.className = 'num'; num.textContent = `Page ${p.index + 1} of ${state.pages.length}`;
      el.append(canvas, layer, num);
      Object.assign(p, { el, canvas, layer });
      // drag a signature thumbnail onto this page
      el.addEventListener('dragover', (e) => {
        if (!e.dataTransfer.types.includes('application/x-sig')) return;
        e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; el.classList.add('drop-target');
      });
      el.addEventListener('dragleave', () => el.classList.remove('drop-target'));
      el.addEventListener('drop', (e) => {
        const id = e.dataTransfer.getData('application/x-sig');
        el.classList.remove('drop-target');
        if (!id) return;
        e.preventDefault(); e.stopPropagation();
        const sig = sigById(id); if (!sig) return;
        const r = layer.getBoundingClientRect();
        placeSig(sig, p.index, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
      });
      wrap.appendChild(el);
    });
    renderPages();
  }

  // Pages are only rendered when near the viewport, and released when far away,
  // so long documents stay fast and light on memory.
  let observer = null;
  let rendering = false;

  function renderPages() {
    state.renderToken++;
    state.scale = baseScale() * state.zoom;
    $('#zoomLabel').textContent = Math.round(state.zoom * 100) + '%';
    state.pages.forEach(p => {
      p.el.style.width = Math.floor(p.vp1.width * state.scale) + 'px';
      p.el.style.height = Math.floor(p.vp1.height * state.scale) + 'px';
      p.renderedScale = null; // stale: re-render when visible
    });
    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          const p = state.pages.find(x => x.el === en.target);
          if (!p) return;
          p.near = en.isIntersecting;
          if (!p.near && p.renderedScale) { // free memory for pages far off-screen
            p.canvas.width = 0; p.canvas.height = 0; p.renderedScale = null;
          }
        });
        pumpRender();
      }, { root: $('#viewer'), rootMargin: '1200px 0px' });
    }
    observer.disconnect();
    state.pages.forEach(p => { p.near = false; observer.observe(p.el); });
    pumpRender();
  }

  async function pumpRender() {
    if (rendering) return;
    rendering = true;
    try {
      while (true) {
        const scale = state.scale, token = state.renderToken;
        const p = state.pages.find(x => x.near && x.renderedScale !== scale);
        if (!p) break;
        const dpr = window.devicePixelRatio || 1;
        const vp = p.page.getViewport({ scale: scale * dpr });
        const off = document.createElement('canvas');
        off.width = Math.floor(vp.width); off.height = Math.floor(vp.height);
        await p.page.render({ canvasContext: off.getContext('2d'), viewport: vp }).promise;
        if (token !== state.renderToken || !p.near || !state.pages.includes(p)) continue;
        p.canvas.width = off.width; p.canvas.height = off.height;
        p.canvas.getContext('2d').drawImage(off, 0, 0);
        p.renderedScale = scale;
      }
    } catch (err) {
      console.error(err);
    } finally {
      rendering = false;
    }
  }

  function setZoom(z) {
    if (!state.pdf) return;
    const v = $('#viewer');
    const ratio = v.scrollTop / Math.max(1, v.scrollHeight);
    state.zoom = clamp(Math.round(z * 100) / 100, 0.5, 3);
    renderPages();
    v.scrollTop = ratio * v.scrollHeight;
  }
  $('#zoomIn').addEventListener('click', () => setZoom(state.zoom + 0.25));
  $('#zoomOut').addEventListener('click', () => setZoom(state.zoom - 0.25));
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => state.pdf && renderPages(), 150); });

  // ---------- Placing signatures ----------
  const hFrac = (item) => {
    const p = state.pages[item.page], sig = sigById(item.sigId);
    return item.fw * sig.aspect * p.vp1.width / p.vp1.height;
  };

  function defaultWidthFrac(sig, pageIndex) {
    const p = state.pages[pageIndex];
    // aim for ~ 180pt wide (about 2.5in), but keep height reasonable
    let fw = 180 / p.vp1.width;
    const maxH = 70 / p.vp1.height;
    if (fw * sig.aspect * p.vp1.width / p.vp1.height > maxH) fw = maxH * p.vp1.height / (sig.aspect * p.vp1.width);
    return clamp(fw, 0.05, 0.9);
  }

  // cx, cy: desired center as fractions of page
  function placeSig(sig, pageIndex, cx, cy, fw) {
    const item = { id: uid(), sigId: sig.id, page: pageIndex, fw: fw || defaultWidthFrac(sig, pageIndex), fx: 0, fy: 0 };
    const h = hFrac(item);
    item.fx = clamp(cx - item.fw / 2, 0, 1 - item.fw);
    item.fy = clamp(cy - h / 2, 0, 1 - h);
    createItemEl(item);
    state.items.push(item);
    select(item);
    return item;
  }

  function visiblePageIndex() {
    const vr = $('#viewer').getBoundingClientRect();
    let best = 0, bestArea = -1;
    state.pages.forEach(p => {
      const r = p.el.getBoundingClientRect();
      const vis = Math.max(0, Math.min(r.bottom, vr.bottom) - Math.max(r.top, vr.top));
      if (vis > bestArea) { bestArea = vis; best = p.index; }
    });
    return best;
  }

  function placeOnVisiblePage(sig) {
    if (!state.pdf) { toast('Open a PDF first'); return; }
    const i = visiblePageIndex();
    const p = state.pages[i];
    const vr = $('#viewer').getBoundingClientRect(), r = p.layer.getBoundingClientRect();
    const top = Math.max(r.top, vr.top), bottom = Math.min(r.bottom, vr.bottom);
    const cy = ((top + bottom) / 2 - r.top) / r.height;
    placeSig(sig, i, 0.5, clamp(cy, 0, 1));
  }

  function createItemEl(item) {
    const sig = sigById(item.sigId);
    const el = document.createElement('div');
    el.className = 'sig-item'; el.tabIndex = 0;
    el.innerHTML = `<img alt="signature"><div class="ctl"><button class="dup" title="Duplicate">⧉</button><button class="x" title="Remove">×</button></div><div class="handle" title="Resize"></div>`;
    el.querySelector('img').src = sig.dataUrl;
    item.el = el;
    state.pages[item.page].layer.appendChild(el);
    positionItem(item);

    el.querySelector('.x').addEventListener('click', (e) => { e.stopPropagation(); removeItem(item); });
    el.querySelector('.dup').addEventListener('click', (e) => {
      e.stopPropagation();
      const h = hFrac(item);
      let cy = item.fy + h * 1.5 + 0.02;
      if (cy + h / 2 > 1) cy = item.fy - h / 2 - 0.02;
      placeSig(sig, item.page, item.fx + item.fw / 2, cy, item.fw);
    });

    el.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.ctl')) return;
      e.preventDefault(); e.stopPropagation();
      select(item); el.focus({ preventScroll: true });
      const resizing = e.target.classList.contains('handle');
      const r = state.pages[item.page].layer.getBoundingClientRect();
      const start = { x: e.clientX, y: e.clientY, fx: item.fx, fy: item.fy, fw: item.fw };
      el.setPointerCapture(e.pointerId);
      const move = (ev) => {
        const dx = (ev.clientX - start.x) / r.width, dy = (ev.clientY - start.y) / r.height;
        if (resizing) {
          const p = state.pages[item.page];
          const maxByH = (1 - item.fy) * p.vp1.height / (sig.aspect * p.vp1.width);
          item.fw = clamp(start.fw + dx, 0.02, Math.min(1 - item.fx, maxByH));
        } else {
          item.fx = clamp(start.fx + dx, 0, 1 - item.fw);
          item.fy = clamp(start.fy + dy, 0, 1 - hFrac(item));
        }
        positionItem(item);
      };
      const up = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
      el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    });
  }

  function positionItem(item) {
    const s = item.el.style;
    s.left = item.fx * 100 + '%';
    s.top = item.fy * 100 + '%';
    s.width = item.fw * 100 + '%';
    s.height = hFrac(item) * 100 + '%';
  }

  function select(item) {
    state.selected = item;
    state.items.forEach(i => i.el.classList.toggle('selected', i === item));
  }
  function removeItem(item) {
    item.el.remove();
    state.items = state.items.filter(i => i !== item);
    if (state.selected === item) state.selected = null;
  }

  // click empty space -> deselect
  $('#viewer').addEventListener('pointerdown', (e) => { if (!e.target.closest('.sig-item')) select(null); });

  // keyboard: nudge / delete
  document.addEventListener('keydown', (e) => {
    const item = state.selected;
    if (!item || $('#modal').classList.contains('open')) return;
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeItem(item); return; }
    if (e.key === 'Escape') { select(null); return; }
    const step = e.shiftKey ? 10 : 1;
    const r = state.pages[item.page].layer.getBoundingClientRect();
    let dx = 0, dy = 0;
    if (e.key === 'ArrowLeft') dx = -step; else if (e.key === 'ArrowRight') dx = step;
    else if (e.key === 'ArrowUp') dy = -step; else if (e.key === 'ArrowDown') dy = step;
    else return;
    e.preventDefault();
    item.fx = clamp(item.fx + dx / r.width, 0, 1 - item.fw);
    item.fy = clamp(item.fy + dy / r.height, 0, 1 - hFrac(item));
    positionItem(item);
  });

  // ---------- Export ----------
  $('#downloadBtn').addEventListener('click', async () => {
    if (!state.bytes) return;
    if (!state.items.length && !confirm('No signatures placed yet. Download anyway?')) return;
    const btn = $('#downloadBtn'); btn.disabled = true; btn.textContent = 'Saving…';
    try {
      const { PDFDocument, degrees } = PDFLib;
      const doc = await PDFDocument.load(state.bytes);
      const embedded = {};
      for (const item of state.items) {
        const sig = sigById(item.sigId);
        if (!embedded[sig.id]) embedded[sig.id] = await doc.embedPng(sig.dataUrl);
        const p = state.pages[item.page];
        const vp = p.vp1; // scale 1 => 1 unit = 1 PDF point, includes page rotation
        const w = item.fw * vp.width;
        const h = w * sig.aspect;
        const left = item.fx * vp.width;
        const bottom = item.fy * vp.height + h;
        // bottom-left corner of the box as seen on screen -> PDF user space
        const [x, y] = vp.convertToPdfPoint(left, bottom);
        doc.getPage(item.page).drawImage(embedded[sig.id], {
          x, y, width: w, height: h, rotate: degrees(vp.rotation || 0),
        });
      }
      const out = await doc.save();
      const blob = new Blob([out], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${state.name || 'document'}-signed.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      toast('Signed PDF downloaded');
    } catch (err) {
      console.error(err);
      toast('Something went wrong saving the PDF');
    } finally {
      btn.disabled = false; btn.textContent = 'Download signed PDF';
    }
  });

  // ---------- File open / drag & drop ----------
  $('#openBtn').addEventListener('click', () => $('#fileInput').click());
  $('#chooseBtn').addEventListener('click', () => $('#fileInput').click());
  $('#fileInput').addEventListener('change', (e) => { if (e.target.files[0]) openPdf(e.target.files[0]); e.target.value = ''; });

  let dragDepth = 0;
  const hasFiles = (e) => e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files');
  window.addEventListener('dragenter', (e) => {
    if (!hasFiles(e) || $('#modal').classList.contains('open')) return;
    dragDepth++; document.body.classList.add('dragging-file');
  });
  window.addEventListener('dragleave', (e) => {
    if (!hasFiles(e)) return;
    dragDepth = Math.max(0, dragDepth - 1);
    if (!dragDepth) document.body.classList.remove('dragging-file');
  });
  window.addEventListener('dragover', (e) => { if (hasFiles(e)) e.preventDefault(); });
  window.addEventListener('drop', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault(); dragDepth = 0; document.body.classList.remove('dragging-file');
    if ($('#modal').classList.contains('open')) return;
    const f = Array.from(e.dataTransfer.files).find(f => f.type === 'application/pdf' || /\.pdf$/i.test(f.name));
    if (f) openPdf(f); else toast('Please drop a PDF file');
  });

  // ---------- Init ----------
  if (window.matchMedia('(pointer: coarse)').matches) {
    $('#sigHint').textContent = 'Tap a signature to place it on the page you’re viewing, then drag it into position. Use the corner dot to resize.';
  }
  loadSigs();
  renderSigList();
})();
