// Shared OCR source for statistics and samples; WD14 visual tags are excluded.
import fs from 'node:fs'
const manifest = JSON.parse(fs.readFileSync('output/images/manifest.json', 'utf8'))
const rows = new Map()
for (const line of fs.readFileSync('output/ImgTag/data.jsonl', 'utf8').split(/\r?\n/)) {
  if (!line.trim()) continue
  const row = JSON.parse(line)
  rows.set(row.path.replaceAll('\\', '/'), row.ocr || '')
}
export function ocrOf(message) {
  const seen = new Set(), texts = []
  for (const seg of message.content || []) {
    if (seg.type !== 'image') continue
    const local = manifest[seg.data?.url]
    if (!local || seen.has(local)) continue
    seen.add(local)
    const text = (rows.get(local.replaceAll('\\', '/')) || '').normalize('NFKC').trim()
    if (text && !texts.includes(text)) texts.push(text)
  }
  return texts.join('\n')
}
export function analysisText(text, ocr) {
  return [text, ocr].filter(Boolean).join('\n').normalize('NFKC')
}
