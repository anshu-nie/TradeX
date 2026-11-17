const axios = require('axios');
const config = require('../config/env');

// Curated educational financial news data clearly labeled as sample content
const SAMPLE_FINANCIAL_NEWS = [
  {
    id: 'news-1',
    title: 'RBI Monetary Policy Committee Maintains Repo Rate at 6.5%',
    description: 'The Reserve Bank of India keeps the policy repo rate unchanged, focusing on balancing inflation management with sustained economic growth in core sectors.',
    category: 'Economy',
    source: 'Financial Express (Sample)',
    sourceType: 'CURATED_SAMPLE',
    url: 'https://www.financialexpress.com',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'news-2',
    title: 'Tech and IT Services Sector Shows Strong Cloud & AI Adoption Growth',
    description: 'Leading technology giants report double-digit growth in cloud migration, cybersecurity contracts, and enterprise artificial intelligence deployments.',
    category: 'Technology',
    source: 'Economic Times (Sample)',
    sourceType: 'CURATED_SAMPLE',
    url: 'https://economictimes.indiatimes.com',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'news-3',
    title: 'Automotive Sector Reports Record EV Deliveries and Infrastructure Expansion',
    description: 'Electric vehicle market penetration hits fresh highs across passenger cars and two-wheelers with expanding nationwide charging infrastructure.',
    category: 'Automotive',
    source: 'Mint (Sample)',
    sourceType: 'CURATED_SAMPLE',
    url: 'https://www.livemint.com',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1558441719-aa34bbe5f347?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'news-4',
    title: 'Renewable Energy Investments Surge with New Solar and Wind Capacity',
    description: 'Clean energy capital commitments surpass previous quarter estimates as institutional investors accelerate green bond allocations.',
    category: 'Energy',
    source: 'Business Standard (Sample)',
    sourceType: 'CURATED_SAMPLE',
    url: 'https://www.business-standard.com',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'news-5',
    title: 'Banking and Financial Services Sector Reports Robust Credit Growth',
    description: 'Commercial banks report sustained retail and MSME loan demand alongside historic low non-performing asset (NPA) ratios across public and private lenders.',
    category: 'Banking',
    source: 'Moneycontrol (Sample)',
    sourceType: 'CURATED_SAMPLE',
    url: 'https://www.moneycontrol.com',
    publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=600&auto=format&fit=crop&q=80'
  }
];

// @desc    Get market news articles
// @route   GET /api/v1/news
// @access  Public
const getMarketNews = async (req, res, next) => {
  try {
    const { category } = req.query;

    if (config.NEWS_API_KEY) {
      try {
        const response = await axios.get(
          `https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey=${config.NEWS_API_KEY}`,
          { timeout: 3000 }
        );
        if (response.data && response.data.articles) {
          const liveArticles = response.data.articles.slice(0, 10).map((art, idx) => ({
            id: `live-${idx}`,
            title: art.title,
            description: art.description,
            category: 'Business',
            source: art.source.name,
            sourceType: 'LIVE_API',
            url: art.url,
            publishedAt: art.publishedAt,
            imageUrl: art.urlToImage
          }));

          return res.status(200).json({
            success: true,
            isDemoMode: false,
            count: liveArticles.length,
            data: liveArticles
          });
        }
      } catch (err) {
        console.warn(`[NewsService] External news API failed: ${err.message}. Using curated educational sample news.`);
      }
    }

    let filteredNews = SAMPLE_FINANCIAL_NEWS;
    if (category && category !== 'ALL') {
      filteredNews = SAMPLE_FINANCIAL_NEWS.filter(
        (n) => n.category.toLowerCase() === category.toLowerCase()
      );
    }

    res.status(200).json({
      success: true,
      isDemoMode: true,
      disclaimer: 'Displaying curated educational financial news for simulation purposes.',
      count: filteredNews.length,
      data: filteredNews
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMarketNews
};
