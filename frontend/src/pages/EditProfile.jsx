import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import axios from "axios";

const ORANGE = "#ff7a00";

export default function EditProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    bio: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('auth/profile/');
      const userData = response.data;
      
      console.log("=== Profile Data Debug ===");
      console.log("Full userData:", userData);
      console.log("avatar field:", userData.avatar);
      console.log("avatar_url field:", userData.avatar_url);
      
      setFormData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
      });
      
      // Set avatar preview with proper URL handling
      if (userData.avatar_url) {
        console.log("Using avatar_url:", userData.avatar_url);
        setAvatarPreview(userData.avatar_url);
      } else if (userData.avatar) {
        const avatarUrl = userData.avatar.startsWith('http') 
          ? userData.avatar 
          : `http://127.0.0.1:8000${userData.avatar}`;
        console.log("Using constructed avatar URL:", avatarUrl);
        setAvatarPreview(avatarUrl);
      } else {
        console.log("No avatar found, setting to null");
        setAvatarPreview(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Format Bangladesh phone number as user types
      const formatted = formatBangladeshPhone(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const formatBangladeshPhone = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Handle different input scenarios
    if (digits.length === 0) return '';
    
    // If starts with 880, add +
    if (digits.startsWith('880')) {
      const remaining = digits.slice(3);
      if (remaining.length <= 4) {
        return `+880 ${remaining}`;
      } else {
        return `+880 ${remaining.slice(0, 4)}-${remaining.slice(4, 10)}`;
      }
    }
    
    // If starts with 0 (local format)
    if (digits.startsWith('0')) {
      const remaining = digits.slice(1);
      if (remaining.length <= 4) {
        return `+880 ${remaining}`;
      } else {
        return `+880 ${remaining.slice(0, 4)}-${remaining.slice(4, 10)}`;
      }
    }
    
    // If starts with 1 (without country code)
    if (digits.startsWith('1')) {
      if (digits.length <= 4) {
        return `+880 ${digits}`;
      } else {
        return `+880 ${digits.slice(0, 4)}-${digits.slice(4, 10)}`;
      }
    }
    
    // Default formatting
    if (digits.length <= 4) {
      return `+880 ${digits}`;
    } else {
      return `+880 ${digits.slice(0, 4)}-${digits.slice(4, 10)}`;
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const validateBangladeshPhone = (phone) => {
    if (!phone) return true; // Phone is optional
    
    const phoneRegex = /^\+880 1[3-9]\d{2}-\d{6}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Validate phone number format (temporarily disabled for debugging)
    // if (formData.phone && !validateBangladeshPhone(formData.phone)) {
    //   setError("Please enter a valid Bangladesh phone number (+880 1XXX-XXXXXX)");
    //   setSaving(false);
    //   return;
    // }

    try {
      console.log("=== Starting profile update ===");
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('bio', formData.bio);
      
      // Add avatar if selected
      if (avatar) {
        console.log("Adding avatar to FormData:", avatar);
        formDataToSend.append('avatar', avatar);
      } else {
        console.log("No avatar selected");
      }

      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      // Use axios directly for file upload to avoid Content-Type conflicts
      const token = localStorage.getItem("accessToken");
      console.log("Making request with token:", token ? "present" : "missing");
      
      const response = await axios.put('http://127.0.0.1:8000/api/v1/auth/profile/', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type, let browser handle it for FormData
        },
      });
      
      console.log("Response received:", response.data);

      console.log("Profile updated successfully:", response.data);
      navigate(-1); // go back to PersonalInfo after saving
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error ||
                          JSON.stringify(error.response?.data) ||
                          error.message ||
                          "Failed to update profile";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading profile...
      </div>
    );
  }

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
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "none",
              background: "#f2f3f7",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            ←
          </button>
          <span
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#555",
            }}
          >
            Edit Profile
          </span>
        </div>

        {/* Avatar circle + pencil */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                overflow: "hidden",
                background: "#ffcfb3",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById('avatar-input').click()}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    // If image fails to load, show default avatar
                    setAvatarPreview(null);
                  }}
                />
              ) : (
                <div style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  color: "#666"
                }}>
                  👤
                </div>
              )}
            </div>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
            <div
              style={{
                position: "absolute",
                right: 0,
                bottom: 2,
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: ORANGE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "0.9rem",
                border: "2px solid #ffffff",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById('avatar-input').click()}
            >
              ✎
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              background: "#fee",
              border: "1px solid #fcc",
              borderRadius: 8,
              padding: "12px",
              marginBottom: 16,
              fontSize: "0.85rem",
              color: "#c33",
            }}
          >
            {error}
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit}>
          <FieldLabel label="FULL NAME" />
          <InputBox
            name="first_name"
            value={`${formData.first_name} ${formData.last_name}`.trim()}
            onChange={(e) => {
              const fullName = e.target.value;
              const names = fullName.split(' ');
              const firstName = names[0] || '';
              const lastName = names.slice(1).join(' ') || '';
              setFormData(prev => ({
                ...prev,
                first_name: firstName,
                last_name: lastName
              }));
            }}
          />

          <FieldLabel label="EMAIL" />
          <InputBox
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
          />

          <FieldLabel label="PHONE NUMBER" />
          <InputBox
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+880 1XXX-XXXXXX"
            maxLength="17"
          />

          <FieldLabel label="BIO" />
          <TextAreaBox
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself..."
            maxLength="500"
          />

          {/* SAVE button (full width, orange) */}
          <button
            type="submit"
            disabled={saving}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "11px 0",
              borderRadius: 10,
              border: "none",
              background: saving ? "#ccc" : ORANGE,
              color: "#fff",
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: "0.9rem",
            }}
          >
            {saving ? "SAVING..." : "SAVE"}
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
        marginBottom: 4,
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
}

function TextAreaBox(props) {
  return (
    <textarea
      {...props}
      rows={3}
      style={{
        width: "100%",
        padding: "9px 11px",
        borderRadius: 8,
        border: "none",
        background: "#f4f6fb",
        fontSize: "0.8rem",
        resize: "none",
        outline: "none",
        boxSizing: "border-box",
        ...props.style,
      }}
    />
  );
}


