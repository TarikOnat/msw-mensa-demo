import { setupServer } from 'msw/node'
import { handlers } from './handlers.js'

// In Node.js (Tests): kein Service Worker, MSW fängt die Requests direkt ab.
// Es sind dieselben Handler wie im Browser.
export const server = setupServer(...handlers)
