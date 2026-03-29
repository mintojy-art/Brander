// Content protection — deters casual copying and scraping.
// Note: OS-level screenshots (Cmd+Shift+3, Snipping Tool) cannot be blocked
// by any web technology — this is a browser limitation, not a code limitation.

export function initProtection() {
  // 1. Disable right-click context menu
  document.addEventListener('contextmenu', (e) => e.preventDefault())

  // 2. Disable drag on images
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault()
  })

  // 3. Block devtools keyboard shortcuts and view-source
  document.addEventListener('keydown', (e) => {
    const ctrl = e.ctrlKey || e.metaKey
    const key  = e.key.toLowerCase()

    // View source (Ctrl+U)
    if (ctrl && key === 'u') { e.preventDefault(); return }

    // Save page (Ctrl+S)
    if (ctrl && key === 's') { e.preventDefault(); return }

    // Print (Ctrl+P)
    if (ctrl && key === 'p') { e.preventDefault(); return }

    // DevTools (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+Shift+K)
    if (e.key === 'F12') { e.preventDefault(); return }
    if (ctrl && e.shiftKey && ['i', 'j', 'c', 'k'].includes(key)) {
      e.preventDefault(); return
    }
  })

  // 4. Detect DevTools open via window size difference and warn
  // (Cannot close it but can clear sensitive data from DOM if desired)
  let devtoolsOpen = false
  const threshold  = 160
  setInterval(() => {
    const widthDiff  = window.outerWidth  - window.innerWidth  > threshold
    const heightDiff = window.outerHeight - window.innerHeight > threshold
    if ((widthDiff || heightDiff) && !devtoolsOpen) {
      devtoolsOpen = true
      console.clear()
      console.log('%c⚠ ORIC — Unauthorized access is monitored.', 'color:red;font-size:16px;font-weight:bold')
    }
    if (!widthDiff && !heightDiff) devtoolsOpen = false
  }, 1000)
}
