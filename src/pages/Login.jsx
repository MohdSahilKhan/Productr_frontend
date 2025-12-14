import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { login, verifyOtp } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [otpError, setOtpError] = useState(false);
  const otpInputRefs = useRef([]);

  useEffect(() => {
    if (showOtp && resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showOtp, resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const identifierValue = /^\d+$/.test(identifier) ? Number(identifier) : identifier;
      const response = await login(identifierValue);
      if (response.data.success) {
        setShowOtp(true);
        setResendTimer(30);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    // Clear error when user starts typing
    if (otpError) {
      setOtpError(false);
      setError("");
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    // Clear error when user pastes
    if (otpError) {
      setOtpError(false);
      setError("");
    }
    
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6 && /^\d$/.test(char)) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);
    const nextEmptyIndex = newOtp.findIndex((val) => !val);
    if (nextEmptyIndex !== -1) {
      otpInputRefs.current[nextEmptyIndex]?.focus();
    } else {
      otpInputRefs.current[5]?.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      setError("Please enter a valid OTP");
      setOtpError(true);
      return;
    }

    setLoading(true);
    setError("");
    setOtpError(false);

    try {
      // Convert to number if it's all digits (phone number), otherwise keep as string (email)
      const identifierValue = /^\d+$/.test(identifier) ? Number(identifier) : identifier;
      const response = await verifyOtp(identifierValue, otpString);
      
      if (response.data.success) {
        // Store user data if needed
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        // Redirect to home screen
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Please enter a valid OTP");
      setOtpError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="logo-container">
          <span className="logo-text">Productr</span>
          <div className="logo-icon"></div>
        </div>
        <img src="/login_background.png" className="bg-pattern" alt="Background pattern" />
        <div className="running-box-wrapper">
          <div className="running-box">
            <img src="/image.png" className="running-img" alt="Runner" />
            <p className="running-text">Uplist your product to market</p>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Login to your Productr Account</h2>

          {!showOtp ? (
            <form onSubmit={handleSubmit}>
              <label htmlFor="email-phone">Email or Phone number</label>
              <input
                id="email-phone"
                type="text"
                placeholder="Enter email or phone number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
              />

              {error && <div className="error-message">{error}</div>}

              <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Login"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <label htmlFor="otp">Enter OTP</label>
              <div className="otp-container">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className={`otp-input ${otpError ? 'error' : ''}`}
                    disabled={loading}
                  />
                ))}
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" disabled={loading}>
                Enter your OTP
              </button>

              <div className="resend-otp">
                <span>Didnt recive OTP ? </span>
                <span className="resend-timer">Resend in {resendTimer}s</span>
              </div>
            </form>
          )}

          {!showOtp && (
            <div className="signup-box">
              <p>Don't have a Productr Account</p>
              <a href="/signup">SignUp Here</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}