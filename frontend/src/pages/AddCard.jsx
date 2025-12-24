import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import { VisaLogo, MastercardLogo, AmexLogo, DiscoverLogo } from "../components/PaymentLogos";

const ORANGE = "#ff7a00";

export default function AddCard() {
  const navigate = useNavigate();
  const location = useLocation();

  // total from Payment (not strictly needed, but useful)
  const total = location.state?.total ?? 1160;

  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [detectedCardType, setDetectedCardType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!holder.trim() || !number.trim() || !expiry.trim() || !cvc.trim()) {
      alert("Please fill in all fields");
      return;
    }

    // Basic card number validation (should be at least 13 digits)
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.length < 13) {
      alert("Please enter a valid card number");
      return;
    }

    // Basic expiry validation (MM/YY or MM/YYYY format)
    if (!/^\d{2}\/\d{2,4}$/.test(expiry)) {
      alert("Please enter expiry date in MM/YY or MM/YYYY format");
      return;
    }

    // Convert MM/YY to MM/YYYY if needed
    let formattedExpiry = expiry;
    if (/^\d{2}\/\d{2}$/.test(expiry)) {
      const [month, year] = expiry.split('/');
      const currentYear = new Date().getFullYear();
      const currentCentury = Math.floor(currentYear / 100) * 100;
      const fullYear = parseInt(year) + currentCentury;
      
      // If the year is in the past, assume next century
      if (fullYear < currentYear) {
        formattedExpiry = `${month}/${fullYear + 100}`;
      } else {
        formattedExpiry = `${month}/${fullYear}`;
      }
    }

    // Basic CVC validation (3-4 digits)
    if (!/^\d{3,4}$/.test(cvc)) {
      alert("Please enter a valid CVC (3-4 digits)");
      return;
    }

    try {
      // Use the already detected card type
      const cardType = detectedCardType || getCardType(cleanNumber);
      
      const paymentMethodData = {
        type: "card",
        details: {
          card_holder: holder.trim(),
          card_number: cleanNumber,
          expiry_date: formattedExpiry,
          cvc: cvc,
          card_type: cardType,
          last_four: cleanNumber.slice(-4)
        }
      };

      console.log("Adding payment method:", paymentMethodData);

      const response = await api.post('customer/payments/methods/', paymentMethodData);
      console.log("Payment method added:", response.data);

      alert("Card added successfully!");

      // Navigate back to payment page to use the new card
      navigate("/payment", { state: { total } });
    } catch (error) {
      console.error("Error adding card:", error);
      console.error("Error details:", error.response?.data);
      
      // Show detailed error message
      let errorMessage = "Failed to add card";
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage += `: ${error.response.data}`;
        } else if (error.response.data.error) {
          errorMessage += `: ${error.response.data.error}`;
        } else if (error.response.data.detail) {
          errorMessage += `: ${error.response.data.detail}`;
        } else {
          errorMessage += `: ${JSON.stringify(error.response.data)}`;
        }
      } else {
        errorMessage += `: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
    }
  };

  const getCardType = (number) => {
    // Enhanced card type detection
    const cleanNumber = number.replace(/\s/g, '');
    
    // Visa: starts with 4
    if (/^4/.test(cleanNumber)) return 'Visa';
    
    // Mastercard: starts with 5 or 2221-2720
    if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return 'Mastercard';
    
    // American Express: starts with 34 or 37
    if (/^3[47]/.test(cleanNumber)) return 'American Express';
    
    // Discover: starts with 6
    if (/^6/.test(cleanNumber)) return 'Discover';
    
    return '';
  };

  const handleNumberChange = (value) => {
    // Format card number with spaces (XXXX XXXX XXXX XXXX)
    const cleanValue = value.replace(/\s/g, '');
    const formattedValue = cleanValue.replace(/(.{4})/g, '$1 ').trim();
    
    setNumber(formattedValue);
    
    // Detect card type in real-time
    const cardType = getCardType(cleanValue);
    setDetectedCardType(cardType);
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f2f2f2",
        display: "flex",
        justifyContent: "center",
        padding: "24px 0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 32,
          background: "#ffffff",
          boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
          padding: "16px 16px 20px",
        }}
      >
        {/* light grey title on very top */}
        <div
          style={{
            fontSize: "0.9rem",
            color: "#b0b0b0",
            marginBottom: 10,
          }}
        >
          Add Card
        </div>

        {/* inner card area */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: "14px 12px 18px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
          }}
        >
          {/* “X  Add Card” pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 999,
              border: "1px solid #2a7be4",
              padding: "4px 10px 4px 4px",
              marginBottom: 18,
              fontSize: "0.75rem",
              color: "#555",
              gap: 6,
            }}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: "none",
                background: "#f2f3f7",
                cursor: "pointer",
                fontSize: "0.7rem",
              }}
            >
              ✕
            </button>
            <span>Add Card</span>
          </div>

          {/* CARD HOLDER NAME */}
          <FieldLabel label="CARD HOLDER NAME" />
          <InputBox
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
          />

          {/* CARD NUMBER */}
          <FieldLabel label="CARD NUMBER" />
          <div style={{ position: 'relative' }}>
            <InputBox
              value={number}
              onChange={(e) => {
                const value = e.target.value;
                if (value.replace(/\s/g, '').length <= 16) {
                  handleNumberChange(value);
                }
              }}
              placeholder="1234 5678 9012 3456"
              maxLength={19} // 16 digits + 3 spaces
            />
            {detectedCardType && (
              <div
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#fff',
                  padding: '4px',
                  borderRadius: 4,
                  border: `1px solid ${ORANGE}`,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {detectedCardType === 'Visa' && <VisaLogo width={24} height={16} />}
                {detectedCardType === 'Mastercard' && <MastercardLogo width={24} height={16} />}
                {detectedCardType === 'American Express' && <AmexLogo width={24} height={16} />}
                {detectedCardType === 'Discover' && <DiscoverLogo width={24} height={16} />}
                {!['Visa', 'Mastercard', 'American Express', 'Discover'].includes(detectedCardType) && (
                  <span style={{ fontSize: '0.7rem', color: ORANGE, fontWeight: 600 }}>
                    {detectedCardType}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* EXPIRE DATE + CVC */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 6,
              marginBottom: 18,
            }}
          >
            <div style={{ flex: 1 }}>
              <FieldLabel label="EXPIRE DATE" />
              <InputBox
                value={expiry}
                onChange={(e) => {
                  // Format expiry date as MM/YY or MM/YYYY
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) {
                    if (value.length <= 4) {
                      // MM/YY format
                      value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    } else {
                      // MM/YYYY format
                      value = value.substring(0, 2) + '/' + value.substring(2, 6);
                    }
                  }
                  setExpiry(value);
                }}
                placeholder="MM/YY or MM/YYYY"
                maxLength={7}
              />
            </div>
            <div style={{ flex: 1 }}>
              <FieldLabel label="CVC" />
              <InputBox
                value={cvc}
                onChange={(e) => {
                  // Only allow digits, max 4 characters
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 4) {
                    setCvc(value);
                  }
                }}
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>

          {/* ADD & MAKE PAYMENT button */}
          <button
            type="submit"
            style={{
              marginTop: 8,
              width: "100%",
              padding: "11px 0",
              borderRadius: 10,
              border: "none",
              background: ORANGE,
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            "ADD CARD"
          </button>
        </form>
      </div>
    </div>
  );
}

function FieldLabel({ label }) {
  return (
    <div
      style={{
        fontSize: "0.7rem",
        color: "#a0a0a0",
        marginBottom: 4,
        marginTop: 6,
      }}
    >
      {label}
    </div>
  );
}

function InputBox(props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "9px 11px",
        borderRadius: 8,
        border: "none",
        background: "#f4f6fb",
        fontSize: "0.8rem",
        outline: "none",
      }}
    />
  );
}
