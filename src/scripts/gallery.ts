/** Gallery category filters and an accessible lightbox (keyboard + swipe). */
export function initGallery(root: HTMLElement) {
  const items = [...root.querySelectorAll<HTMLLIElement>('li[data-category]')];
  const thumbs = [...root.querySelectorAll<HTMLButtonElement>('.thumb')];
  const count = root.querySelector<HTMLElement>('[data-count]');

  root.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((btn, _, all) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter!;
      all.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      let shown = 0;
      items.forEach((li) => {
        const on = f === 'all' || li.dataset.category === f;
        li.hidden = !on;
        if (on) shown++;
      });
      if (count) count.textContent = `${shown} photograph${shown === 1 ? '' : 's'}`;
    });
  });

  const dialog = root.querySelector<HTMLDialogElement>('[data-lightbox]');
  if (!dialog) return;
  const img = dialog.querySelector<HTMLImageElement>('[data-lb-img]')!;
  const cap = dialog.querySelector<HTMLElement>('[data-lb-cap]')!;
  const pos = dialog.querySelector<HTMLElement>('[data-lb-pos]')!;
  let current = 0;
  let opener: HTMLButtonElement | null = null;

  const visibleThumbs = () => thumbs.filter((t) => !t.closest('li')!.hidden);
  const show = (thumb: HTMLButtonElement) => {
    const list = visibleThumbs();
    current = list.indexOf(thumb);
    img.src = thumb.dataset.full!;
    img.alt = thumb.dataset.alt || '';
    img.width = Number(thumb.dataset.w) || 0;
    img.height = Number(thumb.dataset.h) || 0;
    cap.textContent = thumb.dataset.caption || '';
    pos.textContent = `${current + 1} / ${list.length}`;
  };
  const step = (d: number) => {
    const list = visibleThumbs();
    show(list[(current + d + list.length) % list.length]);
  };

  thumbs.forEach((t) => t.addEventListener('click', () => {
    opener = t;
    show(t);
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>('[data-lb-close]')?.focus();
  }));
  dialog.querySelector('[data-lb-close]')?.addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-lb-prev]')?.addEventListener('click', () => step(-1));
  dialog.querySelector('[data-lb-next]')?.addEventListener('click', () => step(1));
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => opener?.focus());

  let sx = 0;
  dialog.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  });
}
