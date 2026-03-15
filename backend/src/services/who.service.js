// src/services/who.service.js
// whoApiService.js ka exact same code — kuch nahi badla

const RSS_TO_JSON = 'https://api.rss2json.com/v1/api.json'
const RSS_FEEDS = {
  news: 'https://www.who.int/rss-feeds/news-english.xml',
  diseaseOutbreaks: 'https://www.who.int/rss-feeds/news-english.xml',
  recommendations: 'https://www.who.int/rss-feeds/statement-english.xml'
}

function stripHtml(html) {
  return html ? html.replace(/<[^>]*>/g, '') : ''
}

function formatDate(dateString) {
  try {
    return new Date(dateString).toISOString().split('T')[0]
  } catch { return new Date().toISOString().split('T')[0] }
}

function categorizeItem(title, feedType) {
  const t = title.toLowerCase()
  if (t.includes('emergency') || t.includes('outbreak') || feedType === 'diseaseOutbreaks') return 'Emergency Alert'
  if (t.includes('report') || t.includes('data')) return 'Health Data'
  if (t.includes('guideline') || feedType === 'recommendations') return 'Guidelines'
  return 'Health News'
}

export async function fetchRSSFeed(feedType, count = 5) {
  const feedUrl = RSS_FEEDS[feedType]
  if (!feedUrl) return []
  try {
    const url = `${RSS_TO_JSON}?rss_url=${encodeURIComponent(feedUrl)}&count=${count}&api_key=wyfqcgbfgmtms7erodjcvm9ccjbukmotjecomqjz`
    const res  = await fetch(url)
    const data = await res.json()
    if (data.status !== 'ok' || !data.items) return []
    return data.items.map((item, i) => ({
      id: item.guid || `${feedType}-${i}`,
      title: item.title,
      description: stripHtml(item.description || ''),
      summary: stripHtml(item.description || '').substring(0, 200) + '...',
      date: formatDate(item.pubDate),
      url: item.link,
      category: categorizeItem(item.title, feedType),
      feedType,
      author: item.author || 'WHO'
    }))
  } catch { return [] }
}

export async function fetchWHONews(options = {}) {
  const { limit = 10, feedTypes = ['news', 'diseaseOutbreaks'] } = options
  const all = []
  for (const ft of [...new Set(feedTypes)]) {
    const items = await fetchRSSFeed(ft, Math.ceil(limit / feedTypes.length))
    all.push(...items)
  }
  const unique = [...new Map(all.map(u => [`${u.title}-${u.url}`, u])).values()]
  return unique.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit)
}

export async function getDiseaseOutbreaks(limit = 10) {
  return fetchRSSFeed('diseaseOutbreaks', limit)
}