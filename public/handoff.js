// Drop zone on the homepage and guide pages. The PDF never leaves the browser:
// we keep the File in IndexedDB on this device, go to /sign, and app.js picks it up and deletes it.
(() => {
  const zone = document.querySelector('[data-dropzone]');
  if (!zone) return;
  const input = zone.querySelector('input[type="file"]');
  const status = zone.querySelector('[data-dropzone-status]');
  const isPdf = (f) => f && (f.type === 'application/pdf' || /\.pdf$/i.test(f.name));

  function stash(file) {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('justsignit-handoff', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('files');
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const tx = req.result.transaction('files', 'readwrite');
        tx.objectStore('files').put({ file, name: file.name, at: Date.now() }, 'pending');
        tx.oncomplete = () => { req.result.close(); resolve(); };
        tx.onerror = tx.onabort = () => reject(tx.error);
      };
    });
  }

  async function handle(file) {
    if (!isPdf(file)) { status.textContent = 'That doesn’t look like a PDF. Please choose a .pdf file.'; return; }
    status.textContent = 'Opening your PDF…';
    if (window.plausible) plausible('pdf_dropped', { props: { from: location.pathname } });
    try { await stash(file); } catch (e) { /* storage blocked: /sign still opens, they pick the file again */ }
    location.href = '/sign';
  }

  input.addEventListener('change', () => { if (input.files[0]) handle(input.files[0]); input.value = ''; });

  const hasFiles = (e) => e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files');
  // Dropping anywhere on the page counts; otherwise the browser would navigate away to the raw PDF.
  window.addEventListener('dragover', (e) => { if (hasFiles(e)) { e.preventDefault(); zone.classList.add('over'); } });
  window.addEventListener('dragleave', (e) => { if (!e.relatedTarget) zone.classList.remove('over'); });
  window.addEventListener('drop', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault(); zone.classList.remove('over');
    handle(Array.from(e.dataTransfer.files).find(isPdf) || e.dataTransfer.files[0]);
  });
})();
