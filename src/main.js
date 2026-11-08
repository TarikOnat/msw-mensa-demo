import { createApp } from 'vue'
import App from './App.vue'
// Schriften der App, lokal aus npm (läuft offline)
import '@fontsource/young-serif/400.css'
import '@fontsource-variable/figtree/wght.css'
import './tokens.css'
import './style.css'

// MSW nur in der Entwicklung starten. Im Produktions-Build landet MSW nicht,
// weil es nur hier und nur per dynamischem Import geladen wird.
async function aktiviereMocking() {
  if (!import.meta.env.DEV || import.meta.env.VITE_MOCKING === 'aus') {
    return false
  }

  const { worker } = await import('./mocks/browser.js')
  const { HttpNetworkFrame } = await import('msw/experimental')
  const { verbindeInspector } = await import('./demo/inspector.js')

  verbindeInspector(worker)

  // Warten, bis der Service Worker aktiv ist. Sonst laufen die ersten
  // Requests der App am Worker vorbei.
  await worker.start({
    // Nur bei API-Requests ohne Handler warnen, nicht bei Vite-Dateien
    onUnhandledFrame({ frame, defaults }) {
      if (
        frame instanceof HttpNetworkFrame &&
        new URL(frame.data.request.url).pathname.startsWith('/api/')
      ) {
        defaults.warn()
      }
    },
  })

  return true
}

aktiviereMocking().then((mockingAktiv) => {
  createApp(App, { mockingAktiv }).mount('#app')
})
