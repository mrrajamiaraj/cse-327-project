import { useState, useEffect } from "react";
import { VisaLogo, MastercardLogo, AmexLogo, DiscoverLogo } from "./PaymentLogos";

const CardPaymentGateway = ({ amount, cardType, cardDetails, onSuccess, onCancel, onError }) => {
  const [step, setStep] = useState("details"); // details, processing, otp, success
  const [cvv, setCvv] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const isVisa = cardType === "Visa";
  const isMastercard = cardType === "Mastercard";
  const isAmex = cardType === "American Express";
  const isDiscover = cardType === "Discover";
  
  const brandColor = isVisa ? "#1a1f71" : isMastercard ? "#eb001b" : isAmex ? "#006fcf" : isDiscover ? "#ff6000" : "#1976d2";

  const handleDetailsSubmit = () => {
    if (cvv.length !== 3) {
      setError("CVV must be 3 digits");
      return;
    }
    setError("");
    setStep("processing");
    
    // Simulate bank processing
    setTimeout(() => {
      setStep("otp");
    }, 2000);
  };

  const handleOtpSubmit = () => {
    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }
    setError("");
    setStep("processing");
    
    // Simulate OTP verification
    setTimeout(() => {
      // Simulate success (95% success rate for demo)
      if (Math.random() > 0.05) {
        setStep("success");
        setTimeout(() => {
          onSuccess({
            transactionId: `${isVisa ? 'VISA' : 'MC'}${Date.now()}${Math.floor(Math.random() * 1000)}`,
            amount: amount,
            cardNumber: cardDetails.last_four,
            cardType: cardType,
            timestamp: new Date().toISOString()
          });
        }, 2000);
      } else {
        setError("Payment failed. Please try again.");
        setStep("otp");
        }
    }, 3000);
  };

  const renderDetailsStep = () => (
    <div style={{ padding: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: brandColor, marginBottom: "8px" }}>
          Confirm Card Details
        </div>
        <div style={{ fontSize: "0.9rem", color: "#666" }}>
          Amount to charge: ৳{amount}
        </div>
      </div>

      {/* Card Display */}
      <div style={{
        background: `linear-gradient(135deg, ${brandColor} 0%, ${isVisa ? '#3949ab' : '#ff5722'} 100%)`,
        borderRadius: "12px",
        padding: "20px",
        color: "white",
        marginBottom: "20px",
        position: "relative",
        minHeight: "120px"
      }}>
        <div style={{ position: "absolute", top: "15px", right: "15px" }}>
          {isVisa && <VisaLogo width={50} height={32} />}
          {isMastercard && <MastercardLogo width={50} height={32} />}
          {isAmex && <AmexLogo width={50} height={32} />}
          {isDiscover && <DiscoverLogo width={50} height={32} />}
        </div>
        
        <div style={{ marginTop: "40px" }}>
          <div style={{ fontSize: "1.2rem", letterSpacing: "2px", marginBottom: "10px" }}>
            •••• •••• •••• {cardDetails.last_four}
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>
            {cardDetails.card_holder || "CARD HOLDER"}
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>
            {cardDetails.expiry || "MM/YY"}
          </div>
        </div>
      </div>

      {/* CVV Input */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontSize: "0.8rem", color: "#666", marginBottom: "8px", display: "block" }}>
          Enter CVV (3 digits on back of card)
        </label>
        <input
          type="password"
          placeholder="CVV"
          value={cvv}
          onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
          style={{
            width: "100%",
            padding: "12px",
            border: "2px solid #e0e0e0",
            borderRadius: "8px",
            fontSize: "1rem",
            textAlign: "center",
            letterSpacing: "4px"
          }}
        />
      </div>

      {error && (
        <div style={{ color: "#ff4444", fontSize: "0.8rem", textAlign: "center", marginBottom: "15px" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "12px",
            backgroundColor: "#f0f0f0",
            color: "#666",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            cursor: "pointer"
          }}
        >
          CANCEL
        </button>
        <button
          onClick={handleDetailsSubmit}
          style={{
            flex: 2,
            padding: "12px",
            backgroundColor: brandColor,
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          PROCEED
        </button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <div style={{ 
        width: "60px", 
        height: "60px", 
        border: "4px solid #f3f3f3",
        borderTop: `4px solid ${brandColor}`,
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        margin: "0 auto 20px"
      }} />
      <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: brandColor, marginBottom: "10px" }}>
        {step === "processing" && otp ? "Verifying OTP..." : "Processing Payment..."}
      </div>
      <div style={{ fontSize: "0.9rem", color: "#666" }}>
        {step === "processing" && otp 
          ? "Please wait while we verify your OTP"
          : "Connecting to your bank securely..."
        }
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );

  const renderOtpStep = () => (
    <div style={{ padding: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: brandColor, marginBottom: "8px" }}>
          Enter OTP
        </div>
        <div style={{ fontSize: "0.9rem", color: "#666" }}>
          We've sent a 6-digit OTP to your registered mobile number
        </div>
        <div style={{ fontSize: "0.8rem", color: "#999", marginTop: "5px" }}>
          •••• •••• {cardDetails.last_four}
        </div>
      </div>

      {/* Bank Logo Simulation */}
      <div style={{
        background: "#f8f9fa",
        borderRadius: "8px",
        padding: "15px",
        marginBottom: "20px",
        textAlign: "center",
        border: "1px solid #e9ecef"
      }}>
        <div style={{ fontSize: "0.9rem", fontWeight: "bold", color: brandColor, marginBottom: "5px" }}>
          🏦 {isVisa ? "Visa Secure" : "Mastercard SecureCode"}
        </div>
        <div style={{ fontSize: "0.75rem", color: "#666" }}>
          Your bank has sent an OTP for secure authentication
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          style={{
            width: "100%",
            padding: "12px",
            border: "2px solid #e0e0e0",
            borderRadius: "8px",
            fontSize: "1.2rem",
            textAlign: "center",
            letterSpacing: "8px"
          }}
        />
      </div>

      {error && (
        <div style={{ color: "#ff4444", fontSize: "0.8rem", textAlign: "center", marginBottom: "15px" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => setStep("details")}
          style={{
            flex: 1,
            padding: "12px",
            backgroundColor: "#f0f0f0",
            color: "#666",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            cursor: "pointer"
          }}
        >
          BACK
        </button>
        <button
          onClick={handleOtpSubmit}
          style={{
            flex: 2,
            padding: "12px",
            backgroundColor: brandColor,
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
"VERIFY & PAY"
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: "15px" }}>
        <button
          style={{
            background: "none",
            border: "none",
            color: brandColor,
            fontSize: "0.8rem",
            textDecoration: "underline",
            cursor: "pointer"
          }}
        >
          Resend OTP
        </button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "4rem", color: "#4caf50", marginBottom: "20px" }}>
        ✓
      </div>
      <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#4caf50", marginBottom: "10px" }}>
        Payment Successful!
      </div>
      <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "15px" }}>
        Your {cardType} card has been charged ৳{amount}
      </div>
      <div style={{ fontSize: "0.8rem", color: "#999", marginBottom: "20px" }}>
        •••• •••• •••• {cardDetails.last_four}
      </div>
      <div style={{ fontSize: "0.8rem", color: "#999" }}>
        Redirecting to order confirmation...
      </div>
    </div>
  );

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "400px",
        maxHeight: "90vh",
        overflow: "auto"
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: brandColor,
          color: "white",
          padding: "15px 20px",
          borderRadius: "12px 12px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {isVisa && <VisaLogo width={32} height={22} />}
            {isMastercard && <MastercardLogo width={32} height={22} />}
            {isAmex && <AmexLogo width={32} height={22} />}
            {isDiscover && <DiscoverLogo width={32} height={22} />}
            <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
              {cardType} Payment
            </span>
          </div>
          {step !== "processing" && step !== "success" && (
            <button
              onClick={onCancel}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "1.5rem",
                cursor: "pointer"
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Content */}
        {step === "details" && renderDetailsStep()}
        {step === "processing" && renderProcessingStep()}
        {step === "otp" && renderOtpStep()}
        {step === "success" && renderSuccessStep()}
      </div>
    </div>
  );
};

export default CardPaymentGateway;