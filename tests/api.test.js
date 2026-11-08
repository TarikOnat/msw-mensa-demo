import { describe, it, expect } from 'vitest'
import { server } from '../src/mocks/node.js'
import { szenarien } from '../src/mocks/szenarien.js'
import { ladeSpeiseplan, bewerte } from '../src/api.js'

// Getestet wird der echte App-Code aus src/api.js.
// Die Antworten kommen von denselben Handlern wie im Browser.

describe('Speiseplan laden', () => {
  it('liefert die Gerichte von heute', async () => {
    const plan = await ladeSpeiseplan('heute')
    expect(plan.gerichte).toHaveLength(4)
    expect(plan.gerichte[0].name).toBe('Linsen-Dal')
  })

  it('liefert drei Preise pro Gericht', async () => {
    const plan = await ladeSpeiseplan('heute')
    expect(plan.gerichte[0].preise).toEqual({ studierende: 2.1, bedienstete: 3.8, gaeste: 4.9 })
  })

  it('liefert das echte Datum von heute und morgen', async () => {
    const heute = await ladeSpeiseplan('heute')
    const morgen = await ladeSpeiseplan('morgen')
    const tage = (new Date(morgen.datum) - new Date(heute.datum)) / 86_400_000
    expect(heute.datum).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(tage).toBe(1)
  })

  it('wirft einen Fehler bei einem unbekannten Tag (404)', async () => {
    await expect(ladeSpeiseplan('gestern')).rejects.toThrow('Status 404')
  })

  it('meldet einen Serverfehler (500)', async () => {
    server.use(szenarien.fehler)
    await expect(ladeSpeiseplan('heute')).rejects.toThrow('Status 500')
  })

  it('kommt mit einer leeren Liste zurecht', async () => {
    server.use(szenarien.leer)
    const plan = await ladeSpeiseplan('heute')
    expect(plan.gerichte).toEqual([])
    expect(plan.datum).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('Gericht bewerten', () => {
  it('bestätigt eine gültige Bewertung', async () => {
    const nachricht = await bewerte(2, 5)
    expect(nachricht).toContain('5 von 5 Sternen')
  })

  it('lehnt eine ungültige Bewertung ab (400)', async () => {
    await expect(bewerte(2, 7)).rejects.toThrow('zwischen 1 und 5')
  })
})
