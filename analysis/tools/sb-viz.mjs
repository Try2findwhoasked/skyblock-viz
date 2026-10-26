import { ocrOf, analysisText } from './ocr-text.mjs'
// 计算统计量 -> output/matlab/viz-data.json（第一步：消息与主题）
import fs from 'node:fs'
import { COMPILED } from './sb-lexicon.mjs'
import { DOMAIN_COMPILED, DOMAIN_CATS } from '../sb-domain.mjs'

const cache = JSON.parse(fs.readFileSync('output/essence.json', 'utf8'))
const nowTs = Math.floor(Date.now() / 1000)
const MIN_TS = 1420070400

const clean = s => String(s || '')
  .replace(/[\u0000-\u001f\u007f]/g, ' ')
  .replace(/[\u0085\u2028\u2029\u00a0\u200b\ufeff]/g, ' ')
  .replace(/https?:\/\/\S+/g, ' ')
  .replace(/\s+/g, ' ').trim()

const msgs = []
const groups = []

for (const g of Object.values(cache)) {
  const list = g.msgs || []
  let nTxt = 0, chars = 0, first = Infinity, last = 0
  const senders = new Set()

  for (const m of list) {
    const textParts = []
    let nImage = 0, nFile = 0, nFace = 0
    for (const s of m.content || []) {
      if (s.type === 'text') textParts.push((s.data && s.data.text) || '')
      else if (s.type === 'image') nImage++
      else if (s.type === 'file') nFile++
      else if (s.type === 'face') nFace++
    }
    const originalText = clean(textParts.join(' '))
    const ocr = clean(ocrOf(m))
    const text = clean(analysisText(originalText, ocr))
    const t0 = m.senderTime
    const ts = t0 > MIN_TS && t0 < nowTs ? t0 : 0
    if (ts) { if (ts < first) first = ts; if (ts > last) last = ts }
    if (text) nTxt++
    chars += text.length
    if (m.sender) senders.add(m.sender)
    msgs.push({ gid: g.gid, gname: g.name, level: g.level, purity: g.purity,
      nick: m.senderNick || '', ts, nImage, nFile, nFace, text, originalText, ocr })
  }

  groups.push({ gid: g.gid, name: g.name, level: g.level, size: g.size || 0,
    purity: g.purity || 0, nMsgs: list.length, nTxt, chars, nSender: senders.size,
    spanDays: isFinite(first) && last ? Math.round((last - first) / 86400) : 0,
    error: g.error || '' })
}

// ---- 主题命中 ----
const topicStats = COMPILED.map(t => ({
  id: t.id, name: t.name, color: t.color, desc: t.desc,
  mention: 0, kwHits: 0, primary: 0,
  kw: t.kw.map(k => ({ k, n: 0 })),
}))

for (const m of msgs) {
  if (!m.text) { m.topic = 'other'; continue }
  let bestI = -1, bestN = 0
  for (let i = 0; i < COMPILED.length; i++) {
    let total = 0
    const res = COMPILED[i].res
    for (let j = 0; j < res.length; j++) {
      res[j].re.lastIndex = 0
      const c = (m.text.match(res[j].re) || []).length
      if (c) { total += c; topicStats[i].kw[j].n += c }
    }
    if (total > 0) {
      topicStats[i].mention++
      topicStats[i].kwHits += total
      if (total > bestN) { bestN = total; bestI = i }
    }
  }
  m.topic = bestI >= 0 ? COMPILED[bestI].id : 'other'
  if (bestI >= 0) topicStats[bestI].primary++
}

const nMsg = msgs.length
const nTxt = msgs.filter(m => m.text).length
const nImgOnly = nMsg - nTxt
const nHasImg = msgs.filter(m => m.nImage > 0).length

// ---- 月度 ----
const mm = new Map()
for (const m of msgs) {
  if (!m.ts) continue
  const d = new Date(m.ts * 1000)
  const key = d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0')
  if (!mm.has(key)) mm.set(key, { key, n: 0, topics: {} })
  const r = mm.get(key)
  r.n++
  r.topics[m.topic] = (r.topics[m.topic] || 0) + 1
}
const monthly = [...mm.values()].sort((a, b) => a.key.localeCompare(b.key))

// ---- 共现 ----
const ids = COMPILED.map(t => t.id)
const co = {}
for (const a of ids) { co[a] = {}; for (const b of ids) co[a][b] = 0 }
const cnt = {}
for (const t of topicStats) cnt[t.id] = t.mention
for (const m of msgs) {
  if (!m.text) continue
  const hit = []
  for (const t of COMPILED) {
    for (const r of t.res) {
      r.re.lastIndex = 0
      if (r.re.test(m.text)) { hit.push(t.id); break }
    }
  }
  for (const a of hit) for (const b of hit) if (a !== b) co[a][b]++
}
const cooccur = {}
for (const a of ids) {
  cooccur[a] = {}
  for (const b of ids) cooccur[a][b] = cnt[a] ? +(co[a][b] / cnt[a]).toFixed(3) : 0
}

// ---- 圈层 ----
const byLevel = {}
for (const m of msgs) {
  if (!m.text) continue
  if (!byLevel[m.level]) byLevel[m.level] = {}
  byLevel[m.level][m.topic] = (byLevel[m.level][m.topic] || 0) + 1
}

// ---- 领域词表匹配（人工精编，替代无监督 n-gram）----
// 口径：df = 出现在多少条含文本精华中（同条内重复只计 1 次）
//      hits = 总命中次数（含重复）
//      topics = 该词在各主题消息中的分布，用于解释语境
const termStats = DOMAIN_COMPILED.map(t => ({
  name: t.name, cat: t.cat, df: 0, hits: 0, topics: {},
}))

for (const m of msgs) {
  if (!m.text) continue
  for (let i = 0; i < DOMAIN_COMPILED.length; i++) {
    const t = DOMAIN_COMPILED[i]
    let total = 0
    for (const re of t.res) { re.lastIndex = 0; total += (m.text.match(re) || []).length }
    if (total > 0) {
      const st = termStats[i]
      st.df++
      st.hits += total
      st.topics[m.topic] = (st.topics[m.topic] || 0) + 1
    }
  }
}

const TERM_MIN_DF = 3
const terms = termStats
  .filter(t => t.df >= TERM_MIN_DF)
  .map(t => {
    // 主语境主题
    let top = 'other', topN = 0
    for (const k in t.topics) if (t.topics[k] > topN) { topN = t.topics[k]; top = k }
    return {
      term: t.name, df: t.df, hits: t.hits,
      cat: t.cat,
      color: (DOMAIN_CATS[t.cat] || {}).color || '#8b949e',
      catName: (DOMAIN_CATS[t.cat] || {}).name || t.cat,
      topTopic: top,
      topShare: t.df ? +(topN / t.df).toFixed(2) : 0,
      lang: /[\u4e00-\u9fff]/.test(t.name) ? 'zh' : 'en',
    }
  })
  .sort((a, b) => b.df - a.df || b.hits - a.hits)

// 出现过的类别（按总 df 排序），供页面图例
const catAgg = {}
for (const t of terms) {
  if (!catAgg[t.cat]) catAgg[t.cat] = { id: t.cat, name: t.catName, color: t.color, df: 0, n: 0 }
  catAgg[t.cat].df += t.df
  catAgg[t.cat].n++
}
const termCats = Object.values(catAgg).sort((a, b) => b.df - a.df)

const payload = {
  generatedAt: new Date().toISOString(),
  analysis: { method: '正文与 OCR 词典匹配；不使用通用图片标签', ocrMsgs: msgs.filter(m => m.ocr).length, ocrOnlyMsgs: msgs.filter(m => m.ocr && !m.originalText).length, originalTextMsgs: msgs.filter(m => m.originalText).length },
  summary: {
    groups: groups.length,
    groupsWithMsgs: groups.filter(g => g.nMsgs > 0).length,
    msgs: nMsg, textMsgs: nTxt, imgOnlyMsgs: nImgOnly, hasImgMsgs: nHasImg,
    chars: msgs.reduce((s, m) => s + m.text.length, 0),
    firstTS: Math.min(...msgs.filter(m => m.ts).map(m => m.ts)),
    lastTS: Math.max(...msgs.filter(m => m.ts).map(m => m.ts)),
    ignoredGroups: groups.filter(g => g.error).length,
  },
  topics: topicStats.map(t => ({
    id: t.id, name: t.name, color: t.color, desc: t.desc,
    mention: t.mention, primary: t.primary, kwHits: t.kwHits,
    kw: t.kw.filter(x => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 8),
  })).sort((a, b) => b.mention - a.mention),
  monthly, cooccur,
  topicOrder: COMPILED.map(t => ({ id: t.id, name: t.name, color: t.color })),
  byLevel,
  groups: groups.sort((a, b) => b.nMsgs - a.nMsgs).map(g => ({
    gid: g.gid, name: g.name, level: g.level, purity: g.purity, size: g.size,
    nMsgs: g.nMsgs, nTxt: g.nTxt, chars: g.chars, nSender: g.nSender,
    spanDays: g.spanDays, error: g.error,
  })),
  terms,
  termCats,
}

fs.writeFileSync('output/matlab/viz-data.json', JSON.stringify(payload), 'utf8')
console.log('OK', (fs.statSync('output/matlab/viz-data.json').size / 1024).toFixed(0) + ' KB')
console.log('msgs', nMsg, 'text', nTxt, 'groups', groups.length, 'months', monthly.length, 'terms', terms.length)
console.log('terms top10:', terms.slice(0, 10).map(t => t.term + ':' + t.df).join(' '))
console.log('cats:', termCats.map(c => c.name + ':' + c.n).join(' '))
console.log('top:', payload.topics.slice(0, 6).map(t => t.name + t.mention).join(' '))