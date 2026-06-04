import { useState, useEffect } from 'react';
import { Plus, Search, Book, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function LibraryPage() {
  const { user } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('education');
  const [activeTab, setActiveTab] = useState('catalog');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const query = search ? search : `subject:${category}`;
        const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12&page=${page}`);
        const data = await res.json();

        const formattedBooks = data.docs.map((doc, idx) => ({
          _id: idx.toString(),
          title: doc.title,
          author: doc.author_name ? doc.author_name[0] : 'Unknown Author',
          isbn: doc.isbn ? doc.isbn[0] : 'N/A',
          category: doc.subject ? doc.subject[0] : 'General',
          available: Math.floor(Math.random() * 5) + 1,
          total: Math.floor(Math.random() * 5) + 5,
          coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null
        }));

        setBooks(formattedBooks);
      } catch (err) {
        console.error("Failed to fetch books", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchBooks, 500);
    return () => clearTimeout(timeoutId);
  }, [search, category, page]);

  const displayed = books;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Library System</h1><p className="page-sub">{loading ? 'Loading catalog...' : `${books.length}+ books in catalog`}</p></div>
        <div className="page-actions">
          {['catalog','borrowing','returns'].map(t => (
            <button key={t} className={`btn btn-sm ${activeTab === t ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
          ))}
          <button className="btn btn-primary btn-sm"><Plus size={14} /> Add Book</button>
        </div>
      </div>

      {activeTab === 'catalog' && (
        <>
          <div className="filter-bar" style={{ flexWrap: 'wrap' }}>
            <div className="search-box" style={{ flex: '1 1 300px' }}>
              <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input placeholder="Search title, author, ISBN..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {['education', 'history', 'science', 'mathematics', 'technology', 'literature'].map(cat => (
                <button 
                  key={cat} 
                  className={`badge ${category === cat ? 'badge-blue' : 'badge-gray'}`}
                  style={{ cursor: 'pointer', border: 'none', textTransform: 'capitalize', padding: '6px 12px' }}
                  onClick={() => { setCategory(cat); setSearch(''); setPage(1); }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {displayed.length === 0 && !loading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No books found.</div>
            ) : displayed.map(book => (
              <div key={book._id} className="card" style={{ transition: 'all 0.2s', background: 'rgba(23, 27, 43, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ width: '100%', height: 160, background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', borderRadius: 'var(--radius-md)', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                  ) : (
                    <Book size={40} style={{ color: 'rgba(255,255,255,0.5)' }} />
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.author}</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  <span className="badge badge-blue">{book.category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 15, color: book.available > 0 ? 'var(--success)' : 'var(--danger)' }}>{book.available}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/{book.total} available</span>
                  </div>
                  <button className={`btn btn-sm ${book.available > 0 ? 'btn-primary' : 'btn-secondary'}`} disabled={book.available === 0} onClick={() => book.available > 0 && toast.success(`Borrowed ${book.title}`)}>
                    {book.available > 0 ? 'Borrow' : 'Reserved'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
             <button className="btn btn-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
               <ArrowLeft size={16} /> Previous
             </button>
             <span style={{ fontSize: 14, fontWeight: 600 }}>Page {page}</span>
             <button className="btn btn-secondary" onClick={() => setPage(p => p + 1)} disabled={loading || displayed.length === 0}>
               Next <ArrowRight size={16} />
             </button>
          </div>
        </>
      )}

      {activeTab === 'borrowing' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Book</th><th>Borrower</th><th>Borrow Date</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody><tr><td colSpan={6} className="table-empty">No borrowing records</td></tr></tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
