import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-logo">ATC</div>
      <div className="navbar-links">
        <button className="navbar-link active">Live Map</button>
        <button className="navbar-link">Flights</button>
        <button className="navbar-link">About</button>
      </div>

      {user ? (
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '15px', marginRight: '20px' }}>
          <button 
            className="navbar-link" 
            onClick={() => navigate('/app')}
            style={{ 
              fontWeight: '600', 
              color: '#3b82f6', 
              background: 'rgba(59, 130, 246, 0.1)',
              padding: '6px 15px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Go to Dashboard
          </button>
          <div 
            onClick={() => navigate('/profile')}
            style={{ 
              width: '35px', 
              height: '35px', 
              borderRadius: '50%', 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '14px', 
              fontWeight: '600',
              cursor: 'pointer',
              border: '2px solid rgba(255,255,255,0.1)'
            }}
            title={profile?.name || user.email}
          >
            {(profile?.name || user.displayName || user.email).charAt(0).toUpperCase()}
          </div>
        </div>
      ) : (
        <button 
          style={{
            marginLeft: 'auto',
            marginRight: '20px',
            border: '1px solid #3b82f6',
            backgroundColor: 'transparent',
            color: '#3b82f6',
            padding: '8px 20px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#3b82f6';
            e.target.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#3b82f6';
          }}
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      )}
    </nav>
  )
}
