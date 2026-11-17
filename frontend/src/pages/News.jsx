import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Calendar, Info, Tag } from 'lucide-react';
import { newsAPI } from '../services/api';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [disclaimer, setDisclaimer] = useState('');

  const categories = ['ALL', 'Economy', 'Technology', 'Banking', 'Automotive', 'Energy'];

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await newsAPI.getNews(selectedCategory);
      if (res.data.success) {
        setArticles(res.data.data);
        if (res.data.disclaimer) {
          setDisclaimer(res.data.disclaimer);
        }
      }
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Financial News & Market Insights
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '2px' }}>
          Stay updated with economic headlines and sector-specific developments.
        </p>
      </div>

      {/* Educational Notice Banner */}
      <div style={{
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: 'var(--radius-md)',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <Info size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.84rem', color: '#1e40af', lineHeight: 1.5 }}>
          <strong>Notice:</strong> {disclaimer || 'Displaying curated educational financial news for academic simulation purposes.'}
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={selectedCategory === cat ? 'btn btn-primary btn-sm' : 'btn-outline btn-sm'}
            style={{ borderRadius: 'var(--radius-full)', padding: '6px 16px', fontWeight: 600 }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* News Cards Grid */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e2e8f0',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px'
          }} />
          <p style={{ color: 'var(--text-muted)' }}>Fetching articles...</p>
        </div>
      ) : articles.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {articles.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              {item.imageUrl && (
                <div style={{
                  height: '180px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '16px',
                  backgroundColor: '#f1f5f9'
                }}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span className="badge-neutral" style={{ fontSize: '0.72rem' }}>
                  <Tag size={12} />
                  {item.category}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} />
                  {new Date(item.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>

              <h3 style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.4,
                marginBottom: '10px'
              }}>
                {item.title}
              </h3>

              <p style={{
                fontSize: '0.86rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                flex: 1,
                marginBottom: '16px'
              }}>
                {item.description}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '12px',
                marginTop: 'auto'
              }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {item.source}
                </span>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Source</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Newspaper size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No news articles found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default News;
