import { setupWorker } from 'msw/browser'
import { handlers } from './handlers.js'

// Im Browser: echter Service Worker (public/mockServiceWorker.js)
export const worker = setupWorker(...handlers)
