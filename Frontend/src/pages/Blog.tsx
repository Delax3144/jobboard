import { Link } from "react-router-dom";

const Icons = {
  ArrowRight: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>,
  Calendar: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
};

export default function Blog() {
  
  // Фейковые данные для статей
  const featuredPost = {
    id: 1,
    title: "The Future of Remote Work: How Top Tech Companies are Adapting",
    excerpt: "Discover the latest trends in remote engineering culture, hybrid models, and how to stand out to global employers without leaving your home office.",
    category: "Future of Work",
    date: "May 10, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"
  };

  const posts = [
    {
      id: 2,
      title: "JobBoard v2.0 is Here: AI-Powered Matching & Enhanced Privacy",
      excerpt: "We've completely overhauled our matching algorithm to connect elite developers with world-class teams faster than ever.",
      category: "Product Update",
      date: "May 02, 2026",
      readTime: "3 min read",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      title: "How to Ace the Technical Interview in 2026",
      excerpt: "Insights from FAANG engineers on what really matters during a system design round and live coding sessions.",
      category: "Career Advice",
      date: "April 28, 2026",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 4,
      title: "Why TypeScript is Still Dominating the Frontend Ecosystem",
      excerpt: "A deep dive into the state of web development, type safety, and why companies are still aggressively hiring TS experts.",
      category: "Engineering",
      date: "April 15, 2026",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <div style={{ 
      background: '#050505', 
      width: '100vw', 
      position: 'relative', 
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
      minHeight: '100vh', 
      overflowX: 'clip',
      paddingBottom: '100px'
    }}>
      
      {/* Декоративные свечения */}
      <div style={{ position: 'absolute', top: '-5%', left: '20%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        
        {/* === HERO SECTION === */}
        <section style={{ textAlign: 'center', padding: '100px 0 60px', animation: 'fadeIn 0.6s ease-out' }}>
          <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#aaa', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '25px' }}>
            JobBoard Blog
          </div>
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 72px)', fontWeight: 950, margin: '0 0 20px', letterSpacing: '-2px', color: '#fff', lineHeight: '1.1' }}>
            Insights for the <br/>
            <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Modern Tech World</span>
          </h1>
          <p style={{ fontSize: 'clamp(18px, 2vw, 20px)', color: '#888', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6', fontWeight: 500 }}>
            Product updates, career advice, and industry trends to help you navigate the future of engineering.
          </p>
        </section>

        {/* === FEATURED POST === */}
        <div style={{ marginBottom: '50px' }}>
          <Link to={`/blog/${featuredPost.id}`} style={{ display: 'block', textDecoration: 'none', borderRadius: '40px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ height: '450px', width: '100%', position: 'relative' }}>
              <img src={featuredPost.image} alt={featuredPost.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.2) 50%, transparent 100%)' }} />
            </div>
            
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '50px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {featuredPost.category}
                </span>
                <span style={{ color: '#aaa', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <Icons.Calendar /> {featuredPost.date} • {featuredPost.readTime}
                </span>
              </div>
              <h2 style={{ color: '#fff', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, marginBottom: '15px', letterSpacing: '-1px', lineHeight: '1.2', maxWidth: '900px' }}>
                {featuredPost.title}
              </h2>
              <p style={{ color: '#bbb', fontSize: '18px', lineHeight: '1.6', maxWidth: '800px', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {featuredPost.excerpt}
              </p>
            </div>
          </Link>
        </div>

        {/* === POSTS GRID === */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
          {posts.map(post => (
            <Link key={post.id} to={`/blog/${post.id}`} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', overflow: 'hidden', textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ height: '220px', width: '100%', overflow: 'hidden' }}>
                <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
              </div>
              <div style={{ padding: '35px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{post.category}</span>
                  <span style={{ width: '4px', height: '4px', background: '#444', borderRadius: '50%' }} />
                  <span style={{ color: '#666', fontSize: '13px', fontWeight: 600 }}>{post.date}</span>
                </div>
                <h3 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, marginBottom: '15px', lineHeight: '1.4', letterSpacing: '-0.5px' }}>
                  {post.title}
                </h3>
                <p style={{ color: '#888', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px', flex: 1 }}>
                  {post.excerpt}
                </p>
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Read Article <span style={{ color: '#10b981' }}><Icons.ArrowRight /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}