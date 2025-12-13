// Payment method logos using actual image files

export const VisaLogo = ({ width = 32, height = 22 }) => (
  <img 
    src="/images/VISA.png" 
    alt="Visa" 
    width={width} 
    height={height}
    style={{ 
      objectFit: 'contain',
      borderRadius: '4px',
      background: 'white'
    }}
  />
);

export const MastercardLogo = ({ width = 32, height = 22 }) => (
  <img 
    src="/images/Mastercard.jpg" 
    alt="Mastercard" 
    width={width} 
    height={height}
    style={{ 
      objectFit: 'contain',
      borderRadius: '4px',
      background: 'white'
    }}
  />
);

export const AmexLogo = ({ width = 32, height = 22 }) => (
  <img 
    src="/images/American-Express.png" 
    alt="American Express" 
    width={width} 
    height={height}
    style={{ 
      objectFit: 'contain',
      borderRadius: '4px',
      background: 'white'
    }}
  />
);

export const DiscoverLogo = ({ width = 32, height = 22 }) => (
  <svg width={width} height={height} viewBox="0 0 32 22" fill="none">
    <rect width="32" height="22" rx="3" fill="#ff6000"/>
    <rect x="1" y="1" width="30" height="20" rx="2" fill="#ff6000"/>
    <text x="16" y="13" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">DISCOVER</text>
    <circle cx="26" cy="6" r="2" fill="white" opacity="0.8"/>
  </svg>
);

export const BkashLogo = ({ width = 32, height = 22 }) => (
  <img 
    src="/images/Bkash.png" 
    alt="bKash" 
    width={width} 
    height={height}
    style={{ 
      objectFit: 'contain',
      borderRadius: '4px',
      background: 'white'
    }}
  />
);

export const CashLogo = ({ width = 32, height = 22 }) => (
  <svg width={width} height={height} viewBox="0 0 32 22" fill="none">
    <rect width="32" height="22" rx="3" fill="#4caf50"/>
    <rect x="1" y="1" width="30" height="20" rx="2" fill="#4caf50"/>
    <rect x="4" y="5" width="24" height="12" rx="2" fill="#2e7d32" stroke="white" strokeWidth="0.5"/>
    <circle cx="16" cy="11" r="3" fill="white"/>
    <text x="16" y="13" textAnchor="middle" fill="#4caf50" fontSize="4" fontWeight="bold">
      ৳
    </text>
  </svg>
);

export const CardLogo = ({ width = 32, height = 22 }) => (
  <svg width={width} height={height} viewBox="0 0 32 22" fill="none">
    <rect width="32" height="22" rx="3" fill="#1976d2"/>
    <rect x="1" y="1" width="30" height="20" rx="2" fill="#1976d2"/>
    <rect x="2" y="6" width="28" height="3" fill="#333"/>
    <rect x="4" y="12" width="12" height="2" fill="white" rx="1"/>
    <rect x="20" y="12" width="8" height="2" fill="white" rx="1"/>
    <text x="28" y="19" textAnchor="end" fontSize="3" fill="white" fontWeight="bold">CARD</text>
  </svg>
);