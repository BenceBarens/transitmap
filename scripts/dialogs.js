document.addEventListener("click", e => {
  const openBtn = e.target.closest("[data-dialog]");
  const closeBtn = e.target.closest("[data-close]");

  if (openBtn) {
    const id = openBtn.dataset.dialog;
    const dialog = document.getElementById(`dialog-${id}`);
    if (dialog) dialog.showModal();
  }

  if (closeBtn) {
    const dialog = closeBtn.closest("dialog");
    if (dialog) dialog.close();
  }
});

document.querySelectorAll("dialog").forEach(d =>
  d.addEventListener("click", e => {
    if (e.target === d) d.close();
  })
);

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.querySelectorAll("dialog[open]").forEach(d => d.close());
  }
});