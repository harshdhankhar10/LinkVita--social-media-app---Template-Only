import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaLock, FaEnvelope, FaTimes } from 'react-icons/fa';
import { FiLogIn } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_API}/api/v1/user/login`, {
        ...formData,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.data.success) {
        localStorage.setItem('auth', JSON.stringify(response.data));
        toast.success(response?.data?.message);
        navigate('/');
      } else {
        if (response.data.message === "Please verify your email address.") {
          setShowVerificationModal(true);
        } else {
          setErrors({ form: response.data.message });
        }
      }
      
    } catch (error) {
      const axiosError = error as any;
      if (axiosError.response?.data?.message === "Please verify your email address.") {
        setShowVerificationModal(true);
      } else {
        setErrors({
          form: axiosError.response?.data?.message || 'Login failed. Please check your credentials.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (countdown > 0) return;
    
    setIsSendingVerification(true);
    try {
      await axios.post(`${import.meta.env.VITE_REACT_APP_API}/api/v1/mail/send-verification-email`, {
        email: formData.email
      });
      toast.success('Verification email sent successfully!');
      setCountdown(60); 
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_API}/api/v1/mail/verify-email`, {
        email: formData.email,
        otp
      });

      if (response.data.success) {
        toast.success('Email verified successfully!');
        setShowVerificationModal(false);
        const loginResponse = await axios.post(`${import.meta.env.VITE_REACT_APP_API}/api/v1/user/login`, formData);
        localStorage.setItem('auth', JSON.stringify(loginResponse.data));
        navigate('/');
      } else {
        toast.error(response.data.message || 'Verification failed');
      }
    } catch (error) {
      toast.error('Verification failed. Please check the OTP and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <header className="bg-white shadow px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">LinkVita</span>
          </Link>
          <Link 
            to="/register" 
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>Create Account</span>
            <FiLogIn className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="h-4 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            
            <div className="px-8 py-8 sm:px-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-gray-500 mt-2">Sign in to your LinkVita account</p>
              </div>

              {errors.form && (
                <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg text-sm flex items-start">
                  <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>{errors.form}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FaEnvelope className="h-4 w-4" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className={`block w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FaLock className="h-4 w-4" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder='*************'
                      className={`block w-full pl-10 pr-10 py-2.5 border ${errors.password ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center items-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="px-8 py-4 bg-gray-50 text-center border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white py-4 mt-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} LinkVita. All rights reserved.
        </div>
      </footer>

      {/* Verification Modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showVerificationModal ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${showVerificationModal ? '' : 'pointer-events-none'}`}
      >
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowVerificationModal(false)}
        />
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: showVerificationModal ? 0 : 20, opacity: showVerificationModal ? 1 : 0 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4">
            <button 
              onClick={() => setShowVerificationModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
            <h3 className="text-xl font-bold text-white">Verify Your Email</h3>
            <p className="text-white/90 mt-1">We've sent a code to {formData.email}</p>
          </div>

          <div className="p-6">
            <div className="flex justify-center space-x-3 mb-6">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={otp[index] || ''}
                  onChange={(e) => {
                    const newOtp = [...otp];
                    newOtp[index] = e.target.value;
                    setOtp(newOtp.join(''));
                    if (e.target.value && index < 5) {
                      const nextInput = document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement;
                      nextInput?.focus();
                    }
                  }}
                  id={`otp-input-${index}`}
                  className="w-12 h-14 text-center text-2xl font-semibold border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[index] && index > 0) {
                      const prevInput = document.getElementById(`otp-input-${index - 1}`) as HTMLInputElement;
                      prevInput?.focus();
                    }
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleResendVerification}
                disabled={isSendingVerification || countdown > 0}
                className="text-sm font-medium text-purple-600 hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isSendingVerification ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
              <span className="text-sm text-gray-500">
                Code expires in <span className="font-medium">10:00</span>
              </span>
            </div>

            <button
              onClick={handleVerifyEmail}
              disabled={otp.length !== 6}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                otp.length !== 6
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md"
              }`}
            >
              Verify Email
            </button>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              Didn't receive the code?{' '}
              <button
                onClick={handleResendVerification}
                disabled={isSendingVerification || countdown > 0}
                className="font-medium text-purple-600 hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Click to resend
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;