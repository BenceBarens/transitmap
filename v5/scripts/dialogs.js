document.addEventListener("click", e => {
  const openBtn = e.target.closest("[data-dialog]");
  const closeBtn = e.target.closest("[data-close]");

  if (openBtn) {
    const id = openBtn.dataset.dialog;
    const dialog = document.getElementById(`dialog-${id}`);
    if (dialog) {
      dialog.showModal();
      dialog.focus({ preventScroll: true });
    }
  }

  if (closeBtn) {
    const dialog = closeBtn.closest("dialog");
    if (dialog) dialog.close();
  }
});

document.querySelectorAll("dialog").forEach(d => {
  d.addEventListener("click", e => {
    const rect = d.getBoundingClientRect();
    const clickedOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;
    if (clickedOutside) d.close();
  });
});

console.info("%c✔%c dialogs.js %cloaded in fully", "background-color: #b8e986; border-color: #417505; border-radius: 100px; padding: 3px", "font-weight: bold;", "  ");