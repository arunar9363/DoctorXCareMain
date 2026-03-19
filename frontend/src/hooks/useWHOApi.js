// services/whoApiService.js
// Utility service for WHO API integration

export class WHOApiService {
  constructor() {
    this.baseUrl = 'https://www.who.int';
    this.apiUrl = 'https://www.who.int/api';
    this.rssToJsonUrl = 'https://api.rss2json.com/v1/api.json';
    
    // WHO RSS Feeds - CONSOLIDATED TO ONLY USE WORKING LINKS
    this.rssFeeds = {
      news: 'https://www.who.int/rss-feeds/news-english.xml',
      // Fallback: Point diseaseOutbreaks to the general news feed as it's the only reliable one.
      diseaseOutbreaks: 'https://www.who.int/rss-feeds/news-english.xml',
      // The statement feed can also be unstable.
      recommendations: 'https://www.who.int/rss-feeds/statement-english.xml'
    };

    // WHO API endpoints
    this.endpoints = {
      news: `${this.apiUrl}/news`,
      search: `${this.apiUrl}/search`,
      countries: `${this.apiUrl}/countries`,
      gho: 'https://ghoapi.azureedge.net/api'
    };
  }

  /**
   * Fetch WHO news and updates
   */
  async fetchNews(options = {}) {
    const { 
      limit = 10, 
      category = '', 
      feedTypes = ['news', 'diseaseOutbreaks'] 
    } = options;

    try {
      const allUpdates = [];
      const feedsToFetch = [...new Set(feedTypes)]; // Ensure unique feed types

      for (const feedType of feedsToFetch) {
        try {
          if (this.rssFeeds[feedType]) {
            const updates = await this.fetchRSSFeed(feedType, Math.ceil(limit / feedsToFetch.length));
            allUpdates.push(...updates);
          } else {
            console.warn(`Feed type '${feedType}' is not defined and will be skipped.`);
          }
        } catch (error) {
          console.warn(`Failed to fetch ${feedType} feed:`, error);
        }
      }

      const sortedUpdates = allUpdates
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      const uniqueUpdates = this.removeDuplicates(sortedUpdates);

      const limitedUpdates = uniqueUpdates.slice(0, limit);

      if (category) {
        return limitedUpdates.filter(update => 
          update.category?.toLowerCase().includes(category.toLowerCase()) ||
          update.title.toLowerCase().includes(category.toLowerCase())
        );
      }
      
      return limitedUpdates;
    } catch (error) {
      console.error('Error fetching WHO news:', error);
      throw new Error('Failed to fetch WHO updates');
    }
  }

  /**
   * Fetch specific RSS feed
   */
  async fetchRSSFeed(feedType, count = 5) {
    const feedUrl = this.rssFeeds[feedType];
    if (!feedUrl) {
      console.error(`Unknown feed type: ${feedType}`);
      return [];
    }

    const rssToJsonUrl = `${this.rssToJsonUrl}?rss_url=${encodeURIComponent(feedUrl)}&count=${count}&api_key=wyfqcgbfgmtms7erodjcvm9ccjbukmotjecomqjz`;
    
    try {
      const response = await fetch(rssToJsonUrl);
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status} for feed: ${feedType}`);
        return [];
      }

      const data = await response.json();
      
      if (data.status !== 'ok' || !data.items) {
        console.error('Invalid RSS data format from rss2json');
        return [];
      }

      return data.items.map((item, index) => ({
        id: item.guid || `${feedType}-${index}`,
        title: item.title,
        description: this.stripHtml(item.description || ''),
        summary: this.stripHtml(item.description || '').substring(0, 200) + '...',
        date: this.formatDate(item.pubDate),
        url: item.link,
        category: this.categorizeItem(item.title, feedType),
        feedType,
        author: item.author || 'WHO',
        image: this.extractImageFromContent(item.content || item.description)
      }));
    } catch (error) {
      console.error(`Failed to fetch or process RSS feed ${feedType}:`, error);
      return [];
    }
  }

  /**
   * Search WHO database
   */
  async searchWHO(query, options = {}) {
    const { 
      limit = 20,
      includeNews = true 
    } = options;

    try {
      const results = [];
      if (includeNews) {
        const newsResults = await this.searchNews(query, limit);
        results.push(...newsResults);
      }
      // Note: Factsheet search is a placeholder as no direct API is available
      return results.slice(0, limit);
    } catch (error) {
      console.error('Error searching WHO database:', error);
      return [];
    }
  }

  /**
   * Search WHO news (by filtering all news)
   */
  async searchNews(query, limit = 10) {
    try {
      const allNews = await this.fetchNews({ limit: 100 });
      return allNews.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);
    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  }

  /**
   * Get disease outbreak alerts
   */
  async getDiseaseOutbreaks(options = {}) {
    const { limit = 10 } = options;
    try {
      // This now correctly fetches from the consolidated news feed
      const outbreaks = await this.fetchRSSFeed('diseaseOutbreaks', limit);
      return outbreaks;
    } catch (error) {
      console.error('Error fetching disease outbreaks:', error);
      return [];
    }
  }

  /**
   * Monitor WHO updates (for real-time notifications)
   */
  startMonitoring(callback, interval = 300000) { // 5 minutes default
    let lastUpdateTime = new Date(0); // Start from beginning of time to get initial data

    const checkForUpdates = async () => {
      try {
        const recentUpdates = await this.fetchNews({ limit: 10 });
        const newUpdates = recentUpdates.filter(update => 
          new Date(update.date) > lastUpdateTime
        );

        if (newUpdates.length > 0) {
          callback(newUpdates);
          // Update lastUpdateTime to the date of the newest item
          lastUpdateTime = new Date(Math.max(...newUpdates.map(e => new Date(e.date))));
        }
      } catch (error) {
        console.error('Error monitoring WHO updates:', error);
      }
    };

    checkForUpdates(); // Initial check
    const intervalId = setInterval(checkForUpdates, interval);
    return () => clearInterval(intervalId); // Return function to stop monitoring
  }

  // --- HELPER FUNCTIONS ---

  /**
   * Strip HTML tags from text
   */
  stripHtml(html) {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }

  /**
   * Format date to YYYY-MM-DD
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split('T')[0];
      }
      return date.toISOString().split('T')[0];
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Categorize item based on title and feed type
   */
  categorizeItem(title, feedType) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('emergency') || lowerTitle.includes('alert') || 
        lowerTitle.includes('outbreak') || feedType === 'diseaseOutbreaks') {
      return 'Emergency Alert';
    }
    if (lowerTitle.includes('surveillance') || lowerTitle.includes('data') || 
        lowerTitle.includes('report') || lowerTitle.includes('statistics')) {
      return 'Health Data';
    }
    if (lowerTitle.includes('guideline') || lowerTitle.includes('recommendation') || 
        lowerTitle.includes('strategy') || feedType === 'recommendations') {
      return 'Guidelines';
    }
    return 'Health News';
  }

  /**
   * Extract image URL from content
   */
  extractImageFromContent(content) {
    if (!content) return null;
    const imgRegex = /<img[^>]+src="([^">]+)"/i;
    const match = content.match(imgRegex);
    return match ? match[1] : null;
  }

  /**
   * Remove duplicate updates
   */
  removeDuplicates(updates) {
    const seen = new Set();
    return updates.filter(update => {
      const key = `${update.title}-${update.url}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

// Export singleton instance
export const whoApiService = new WHOApiService();

// Export default class for custom instantiation
export default WHOApiService;