import { useState, useEffect } from "react";

const BkashPaymentGateway = ({ amount, onSuccess, onCancel, onError }) => {
  const [step, setStep] = useState("phone"); // phone, pin, confirm, processing, success
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    
    // Format as Bangladesh mobile number
    if (digits.length <= 11) {
      if (digits.startsWith("880")) {
        // +880 format
        return digits.replace(/(\d{3})(\d{4})(\d{4})/, "+$1 $2-$3");
      } else if (digits.startsWith("01")) {
        // 01XXX format
        return digits.replace(/(\d{2})(\d{3})(\d{6})/, "$1$2-$3");
      }
    }
    return digits;
  };

  const handlePhoneSubmit = () => {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 11 || (!cleanPhone.startsWith("880") && !cleanPhone.startsWith("01"))) {
      setError("Please enter a valid Bangladesh mobile number");
      return;
    }
    setError("");
    setStep("pin");
  };

  const handlePinSubmit = () => {
    if (pin.length !== 5) {
      setError("PIN must be 5 digits");
      return;
    }
    setError("");
    setStep("confirm");
  };

  const handleConfirmPayment = () => {
    setLoading(true);
    setStep("processing");
    
    // Simulate payment processing
    setTimeout(() => {
      // Simulate success (90% success rate for demo)
      if (Math.random() > 0.1) {
        setStep("success");
        setTimeout(() => {
          onSuccess({
            transactionId: `BK${Date.now()}${Math.floor(Math.random() * 1000)}`,
            amount: amount,
            phoneNumber: phoneNumber,
            timestamp: new Date().toISOString()
          });
        }, 2000);
      } else {
        setError("Payment failed. Please try again.");
        setStep("confirm");
        setLoading(false);
      }
    }, 3000);
  };

  const renderPhoneStep = () => (
    <div style={{ padding: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#e2136e", marginBottom: "8px" }}>
          Enter Your Bkash Number
        </div>
        <div style={{ fontSize: "0.9rem", color: "#666" }}>
          Amount to pay: ৳{amount}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="tel"
          placeholder="01XXXXXXXXX or +880XXXXXXXXX"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
          style={{
            width: "100%",
            padding: "12px",
            border: "2px solid #e2136e",
            borderRadius: "8px",
            fontSize: "1rem",
            textAlign: "center"
          }}
        />
      </div>

      {error && (
        <div style={{ color: "#ff4444", fontSize: "0.8rem", textAlign: "center", marginBottom: "15px" }}>
          {error}
        </div>
      )}

      <button
        onClick={handlePhoneSubmit}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#e2136e",
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
  );

  const renderPinStep = () => (
    <div style={{ padding: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#e2136e", marginBottom: "8px" }}>
          Enter Your PIN
        </div>
        <div style={{ fontSize: "0.9rem", color: "#666" }}>
          {phoneNumber}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="password"
          placeholder="Enter 5-digit PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 5))}
          style={{
            width: "100%",
            padding: "12px",
            border: "2px solid #e2136e",
            borderRadius: "8px",
            fontSize: "1.5rem",
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
          onClick={() => setStep("phone")}
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
          onClick={handlePinSubmit}
          style={{
            flex: 2,
            padding: "12px",
            backgroundColor: "#e2136e",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          CONFIRM
        </button>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div style={{ padding: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#e2136e", marginBottom: "15px" }}>
          Confirm Payment
        </div>
      </div>

      <div style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span>Merchant:</span>
          <span style={{ fontWeight: "bold" }}>Food Delivery App</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span>Amount:</span>
          <span style={{ fontWeight: "bold", color: "#e2136e" }}>৳{amount}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span>From:</span>
          <span style={{ fontWeight: "bold" }}>{phoneNumber}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Fee:</span>
          <span>৳0.00</span>
        </div>
      </div>

      {error && (
        <div style={{ color: "#ff4444", fontSize: "0.8rem", textAlign: "center", marginBottom: "15px" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => setStep("pin")}
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
          onClick={handleConfirmPayment}
          disabled={loading}
          style={{
            flex: 2,
            padding: "12px",
            backgroundColor: loading ? "#ccc" : "#e2136e",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "PROCESSING..." : "PAY NOW"}
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
        borderTop: "4px solid #e2136e",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        margin: "0 auto 20px"
      }} />
      <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#e2136e", marginBottom: "10px" }}>
        Processing Payment...
      </div>
      <div style={{ fontSize: "0.9rem", color: "#666" }}>
        Please wait while we process your payment
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

  const renderSuccessStep = () => (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "4rem", color: "#4caf50", marginBottom: "20px" }}>
        ✓
      </div>
      <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#4caf50", marginBottom: "10px" }}>
        Payment Successful!
      </div>
      <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "20px" }}>
        Your payment of ৳{amount} has been processed successfully
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
          backgroundColor: "#e2136e",
          color: "white",
          padding: "15px 20px",
          borderRadius: "12px 12px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
            Bkash Payment
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
        {step === "phone" && renderPhoneStep()}
        {step === "pin" && renderPinStep()}
        {step === "confirm" && renderConfirmStep()}
        {step === "processing" && renderProcessingStep()}
        {step === "success" && renderSuccessStep()}
      </div>
    </div>
  );
};

export default BkashPaymentGateway;