import { useEffect, useMemo, useState } from 'react';

const fallbackBooks = [
  {
    title: 'The Midnight Library',
    author: 'Matt Haig',
    category: 'Fiction',
    accent: 'sunset',
    rating: 4.9,
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Self Growth',
    accent: 'lake',
    rating: 4.8,
  },
  {
    title: 'Educated',
    author: 'Tara Westover',
    category: 'Memoir',
    accent: 'rose',
    rating: 4.7,
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    category: 'Classics',
    accent: 'forest',
    rating: 4.9,
  },
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    category: 'Productivity',
    accent: 'gold',
    rating: 4.8,
  },
  {
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    category: 'Mystery',
    accent: 'plum',
    rating: 4.6,
  },
];

const resolveBooksFromApi = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload && Array.isArray(payload.books)) {
    return payload.books;
  }

  if (payload && Array.isArray(payload.content)) {
    return payload.content;
  }

  return [];
};

const mapBook = (entry, index) => {
  const book = entry ?? {};
  const title = book.title ?? book.name ?? `Featured Book ${index + 1}`;
  const author =
    book.author ??
    book.authorName ??
    book.writer ??
    'Unknown Author';

  const category =
    book.category ??
    book.genre ??
    book.categoryName ??
    'General';

  const accent =
    book.accent ??
    book.coverColor ??
    ['sunset', 'lake', 'rose', 'forest', 'gold', 'plum'][index % 6];

  const rating =
    typeof book.rating === 'number'
      ? book.rating
      : typeof book.averageRating === 'number'
        ? book.averageRating
        : 4.6;

  return {
    title,
    author,
    category,
    accent,
    rating,
  };
};

const getApiUrls = () => {
  const baseUrl = (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:8080'
  ).replace(/\/$/, '');

  return [
    `${baseUrl}/api/books`,
    `${baseUrl}/books`,
    `${baseUrl}/api/library/books`,
    '/api/books',
  ];
};

const fetchBookCatalog = async () => {
  const apiUrls = getApiUrls();

  for (const url of apiUrls) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }

      const payload = await response.json();
      const books = resolveBooksFromApi(payload).map(mapBook);

      if (books.length > 0) {
        return books;
      }
    } catch (error) {
      console.warn(`API not available at ${url}:`, error.message);
    }
  }

  return fallbackBooks;
};

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadBooks = async () => {
      try {
        const fetchedBooks = await fetchBookCatalog();
        if (isMounted) {
          setBooks(fetchedBooks);
          setError('');
        }
      } catch (loadError) {
        if (isMounted) {
          setBooks(fallbackBooks);
          setError('Showing the latest popular reads while the library API is being reached.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBooks();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(books.map((book) => book.category))];
    return ['All', ...uniqueCategories];
  }, [books]);

  const filteredBooks = useMemo(() => {
    if (selectedCategory === 'All') return books;
    return books.filter((book) => book.category === selectedCategory);
  }, [books, selectedCategory]);

  return (
    <div className="home-page">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">G</div>
          <div className="brand-text">
            <span className="brand-name">GRK Library</span>
            <span className="brand-tag">Read. Learn. Repeat.</span>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#discover">Discover</a>
          <a href="#collections">Collections</a>
          <a href="#members">Members</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-actions">
          <button type="button" className="ghost-button">
            Sign in
          </button>
          <button type="button" className="primary-button">
            Join free
          </button>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">Your personal library, reimagined</span>
            <h1>Build a reading life that feels like home.</h1>
            <p>
              Explore curated books, smart recommendations, and calm study spaces for
              readers, students, and lifelong learners across your digital library.
            </p>

            <div className="cta-row">
              <button type="button" className="primary-button large-button">
                Start reading
              </button>
              <button type="button" className="secondary-button large-button">
                Browse catalog
              </button>
            </div>

            <div className="hero-stats" id="members">
              <div>
                <strong>120K+</strong>
                <span>members</span>
              </div>
              <div>
                <strong>{books.length || 18}K</strong>
                <span>books</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <span>reader rating</span>
              </div>
            </div>
          </div>

          <div className="hero-visual" aria-label="Featured books showcase">
            <div className="floating-book featured-book">
              <div className="book-cover cover-sunset">
                <span>Current pick</span>
              </div>
              <div className="book-meta">
                <h3>{books[0]?.title || 'Silent Horizons'}</h3>
                <p>{books[0]?.author || 'Hannah Brooks'}</p>
              </div>
            </div>

            <div className="mini-panel">
              <div className="mini-header">
                <span className="status-dot" />
                Trending now
              </div>
              <ul>
                <li>
                  <span>Fiction</span>
                  <strong>36%</strong>
                </li>
                <li>
                  <span>Productivity</span>
                  <strong>24%</strong>
                </li>
                <li>
                  <span>Classics</span>
                  <strong>19%</strong>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="discover-section" id="discover">
          <div className="section-heading">
            <div>
              <span className="eyebrow dark">Popular this week</span>
              <h2>Pick a shelf that matches your mood.</h2>
            </div>
            <a href="#collections" className="text-link">
              View all picks
            </a>
          </div>

          {loading && <div className="info-banner">Loading latest books from the library API…</div>}
          {!loading && error && <div className="info-banner warning">{error}</div>}

          <div className="filter-row" aria-label="Book categories">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  selectedCategory === category ? 'filter-chip active' : 'filter-chip'
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="book-grid" id="collections">
            {filteredBooks.map((book) => (
              <article key={`${book.title}-${book.author}`} className="book-item">
                <div className={`book-cover ${book.accent}`}>
                  <span>{book.category}</span>
                </div>
                <div className="book-info">
                  <div className="rating-row">
                    <span>★ {book.rating}</span>
                    <button type="button" className="save-button">
                      Save
                    </button>
                  </div>
                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="feature-section" id="about">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Curated shelves</h3>
            <p>
              Explore hand-picked collections for every mood, from deep focus to slow
              evenings.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>Smart recommendations</h3>
            <p>
              Discover titles based on your reading habits and the stories you keep
              returning to.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Stay inspired</h3>
            <p>
              Get reading reminders, awards, and personalized follow-ups that keep
              momentum alive.
            </p>
          </div>
        </section>

        <section className="cta-banner">
          <div>
            <span className="eyebrow dark">New season, new story</span>
            <h2>Ready to start your next chapter?</h2>
          </div>
          <div className="cta-actions">
            <button type="button" className="primary-button large-button">
              Create account
            </button>
            <button type="button" className="ghost-button large-button">
              Learn more
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
