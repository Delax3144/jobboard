import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ 
      background: '#050505', 
      width: '100vw', 
      position: 'relative', 
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
      height: 'calc(100vh - 80px)', 
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      
      {/* Декоративные космические свечения */}
      <div style={{ position: 'absolute', top: '20%', left: '30%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '30%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.04) 0%, transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '500px', animation: 'fadeIn 0.5s ease-out' }}>
        
        {/* Огромный неоновый 404 */}
        <h1 style={{ 
          fontSize: 'clamp(100px, 15vw, 160px)', 
          fontWeight: 950, 
          margin: '0 0 10px 0', 
          lineHeight: 1, 
          letterSpacing: '-0.05em',
          background: 'linear-gradient(135deg, #10b981, #34d399, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 30px rgba(16, 185, 129, 0.2))'
        }}>
          404
        </h1>

        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 15px 0', letterSpacing: '-0.5px' }}>
          Страница не найдена
        </h2>
        
        <p style={{ color: '#888', fontSize: '16px', lineHeight: '1.6', margin: '0 0 40px 0', padding: '0 20px' }}>
          Похоже, такого адреса не существует. Вернись на главную страницу платформы или перейди к активному поиску вакансий.
        </p>

        {/* Красивые кнопки действий */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
            to="/" 
            style={{ 
              background: '#fff', color: '#000', padding: '14px 28px', borderRadius: '14px', 
              fontSize: '15px', fontWeight: 800, textDecoration: 'none', transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(255,255,255,0.1)'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            ← На главную
          </Link>
          
          <Link 
            to="/jobs" 
            style={{ 
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', 
              color: '#fff', padding: '14px 28px', borderRadius: '14px', 
              fontSize: '15px', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' 
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            К вакансиям →
          </Link>
        </div>

      </div>
    </div>
  );
}