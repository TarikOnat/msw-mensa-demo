import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from '../src/mocks/node.js'

// 1. Vor allen Tests: MSW einschalten. Unbekannte Requests = Fehler.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))

// 2. Nach jedem Test: Sonderfälle (server.use) wieder entfernen.
afterEach(() => server.resetHandlers())

// 3. Nach allen Tests: MSW ausschalten.
afterAll(() => server.close())
