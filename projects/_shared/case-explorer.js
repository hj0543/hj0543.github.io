// Each embed owns its local explanation state. No API requests or parent access.
const controls = [...document.querySelectorAll('[data-select]')];
const panels = [...document.querySelectorAll('[data-panel]')];

function selectPanel(value) {
  controls.forEach(control => control.setAttribute('aria-pressed', String(control.dataset.select === value)));
  panels.forEach(panel => { panel.hidden = panel.dataset.panel !== value; });
  document.body.dataset.active = value;
}

controls.forEach((control, index) => {
  control.addEventListener('click', () => selectPanel(control.dataset.select));
  control.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % controls.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + controls.length) % controls.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = controls.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectPanel(controls[next].dataset.select);
    controls[next].focus();
  });
});

function reportHeight() {
  window.parent.postMessage({ type: 'project-visual:resize', height: Math.ceil(document.body.getBoundingClientRect().height) + 2 }, '*');
}
new ResizeObserver(reportHeight).observe(document.body);
window.addEventListener('load', reportHeight);
window.addEventListener('message', event => {
  if (event.source === window.parent && event.data?.type === 'project-visual:measure') reportHeight();
});
