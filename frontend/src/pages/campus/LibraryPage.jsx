import { useState, useEffect } from 'react';
import { Plus, Search, Book, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { format } from 'date-fns';

export default function LibraryPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('catalog');

  useEffect(() => {
    setLoading(false); // stub
  }, []);

  const SAMPLE_BOOKS = [
    { _id: '1', title: 'Introduction to Computing', author: 'John Smith', isbn: '978-0123456789', category: 'Science & Technology', available: 5, total: 8, coverUrl: null },
    { _id: '2', title: 'College Mathematics', author: 'Maria Garcia', isbn: '978-9876543210', category: 'Mathematics', available: 3, total: 5, coverUrl: null },
    { _id: '3', title: 'English Communication', author: 'James Brown', isbn: '978-1122334455', category: 'Language & Literature', available: 7, total: 10, coverUrl: null },
    { _id: '4', title: 'Business Ethics', author: 'Ana Reyes', isbn: '978-5544332211', category: 'Business', available: 2, total: 6, coverUrl: null },
    { _id: '5', title: 'Philippine History', author: 'Carlos Santos', isbn: '978-6677889900', category: 'Social Sciences', available: 0, total: 4, coverUrl: null },
    { _id: '6', title: 'Calculus for Engineers', author: 'David Lee', isbn: '978-1234567890', category: 'Mathematics', available: 4, total: 7, coverUrl: null },
  ];

  const displayed = SAMPLE_BOOKS.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Library System</h1><p className="page-sub">6 books in catalog</p></div>
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
          <div className="filter-bar">
            <div className="search-box" style={{ flex: 1 }}>
              <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input placeholder="Search title, author, ISBN..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="grid-3">
            {displayed.map(book => (
              <div key={book._id} className="card" style={{ transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ width: '100%', height: 140, background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', borderRadius: 'var(--radius-md)', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Book size={40} style={{ color: 'rgba(255,255,255,0.5)' }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, lineHeight: 1.3 }}>{book.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{book.author}</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  <span className="badge badge-blue">{book.category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 15, color: book.available > 0 ? 'var(--success)' : 'var(--danger)' }}>{book.available}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/{book.total} available</span>
                  </div>
                  <button className={`btn btn-sm ${book.available > 0 ? 'btn-primary' : 'btn-secondary'}`} disabled={book.available === 0}>
                    {book.available > 0 ? 'Borrow' : 'Reserved'}
                  </button>
                </div>
              </div>
            ))}
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
