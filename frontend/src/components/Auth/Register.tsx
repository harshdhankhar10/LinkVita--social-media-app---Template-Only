import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBirthdayCake, FaImage, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { FiLogIn } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {storage} from "@/Firebase/Firebase"
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";


interface FormData {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  profilePicture: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePicture: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'Other'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isModalOpenForEmailVerification, setIsModalOpenForEmailVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.userName.trim()) newErrors.userName = 'Username is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    try {
      const file = e.target.files[0];
      const storageRef = ref(storage, `linkVita_users_profilePictures/${file.name}`);
       const uploadTask = uploadBytesResumable(storageRef, file);

       uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }, 
        (error) => {
          console.log(error);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setImage(downloadURL);
          setImagePreview(URL.createObjectURL(file));
  
          setFormData(prev => ({
            ...prev,
            profilePicture: downloadURL
          }));
          toast.success('Image uploaded successfully!');
        }    
      );
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image. Please try again.');
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 3) return handleNextStep();
    if (!termsAccepted) {
      setErrors({ terms: 'Please accept the terms and conditions' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { confirmPassword, ...userData } = formData;
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_API}/api/v1/user/register`, userData);
      if(response.data.success){
        toast.success('Registration successful! Please check your email to verify your account.');
        await axios.post(`${import.meta.env.VITE_REACT_APP_API}/api/v1/mail/send-verification-email`, { email: formData.email });
        setIsModalOpenForEmailVerification(true);
      }
    } catch (error) {
      const axiosError = error as any;
      setErrors({
        form: axiosError.response?.data?.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmail = async ()=>{
    try {
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_API}/api/v1/mail/verify-email`, {
        email: formData.email,
        otp
      });
      if(response.data.success){
        toast.success('Email verified successfully! You can now log in.');
        setTimeout(() => {
          navigate('/login');
        }
        , 2000);
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying email. Please try again.');
      toast.error('Error verifying email. Please try again.');
    }
  }

  const handleResendOtp = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_API}/api/v1/mail/send-verification-email`, { email: formData.email });
      if(response.data.success){
        toast.success('Verification email resent successfully! Please check your inbox.');
      } else {
        toast.error('Failed to resend verification email. Please try again.');
      }
    } catch (error) {
      console.error('Error resending OTP. Please try again.');
      toast.error('Error resending OTP. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <header className="bg-white shadow px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">LinkVita</span>
          </Link>
          <Link 
            to="/login" 
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>Sign In</span>
            <FiLogIn className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
                <div className="h-24 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div className="px-6 pb-6 -mt-12">
                  <div className="w-24 h-24 mx-auto rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center">
                    <div className="rounded-full flex items-center justify-center text-white font-bold">
                      <img src="/logo.png" alt="" className='h-full w-full relative top-2' />
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-center mt-4 text-gray-800">Join LinkVita</h2>
                  <p className="text-gray-500 text-center text-sm mt-2">Connect with friends and share your moments with the world</p>
                  
                  <div className="mt-8 space-y-6">
                    <div className={`flex items-center space-x-3 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step === 1 ? 'bg-blue-600 text-white' : step > 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        1
                      </div>
                      <div>
                        <p className="font-medium">Basic Information</p>
                        <p className="text-xs text-gray-500">Your identity</p>
                      </div>
                    </div>
                    
                    <div className={`flex items-center space-x-3 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step === 2 ? 'bg-blue-600 text-white' : step > 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        2
                      </div>
                      <div>
                        <p className="font-medium">Security Setup</p>
                        <p className="text-xs text-gray-500">Protect your account</p>
                      </div>
                    </div>
                    
                    <div className={`flex items-center space-x-3 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step === 3 ? 'bg-blue-600 text-white' : step > 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        3
                      </div>
                      <div>
                        <p className="font-medium">Personal Details</p>
                        <p className="text-xs text-gray-500">Complete your profile</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Create Your Account</h2>
                  <span className="text-sm font-medium text-blue-600">Step {step} of 3</span>
                </div>
                
                {errors.form && (
                  <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg text-sm flex items-start">
                    <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>{errors.form}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {step === 1 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <FaUser className="h-4 w-4" />
                          </div>
                          <input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className={`block w-full pl-10 pr-3 py-2.5 border ${errors.fullName ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm`}
                          />
                        </div>
                        {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <FaUser className="h-4 w-4" />
                          </div>
                          <input
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            placeholder="johndoe"
                            className={`block w-full pl-10 pr-3 py-2.5 border ${errors.userName ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm`}
                          />
                        </div>
                        {errors.userName && <p className="mt-1 text-sm text-red-600">{errors.userName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <FaEnvelope className="h-4 w-4" />
                          </div>
                          <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className={`block w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm`}
                          />
                        </div>
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <FaLock className="h-4 w-4" />
                          </div>
                          <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`block w-full pl-10 pr-3 py-2.5 border ${errors.password ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm`}
                          />
                        </div>
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <FaLock className="h-4 w-4" />
                          </div>
                          <input
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`block w-full pl-10 pr-3 py-2.5 border ${errors.confirmPassword ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm`}
                          />
                        </div>
                        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                      </div>

                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements</h4>
                        <ul className="space-y-1 text-xs text-blue-700">
                          <li className="flex items-center">
                            <svg className="h-3.5 w-3.5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            At least 8 characters long
                          </li>
                          <li className="flex items-center">
                            <svg className="h-3.5 w-3.5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Include both uppercase and lowercase letters
                          </li>
                          <li className="flex items-center">
                            <svg className="h-3.5 w-3.5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Include at least one number or special character
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                              <FaPhone className="h-4 w-4" />
                            </div>
                            <input
                              name="phoneNumber"
                              type="tel"
                              value={formData.phoneNumber}
                              onChange={handleChange}
                              placeholder="+1 (555) 123-4567"
                              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                              <FaBirthdayCake className="h-4 w-4" />
                            </div>
                            <input
                              name="dateOfBirth"
                              type="date"
                              value={formData.dateOfBirth}
                              onChange={handleChange}
                              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-4 p-4 bg-white rounded-2xl shadow-md border border-gray-200 w-full mx-auto">
  <label htmlFor="profilePicture" className="text-sm font-semibold text-gray-800">
    Upload Your Profile Picture <sup className='text-red-500'>*</sup>
  </label>

  <div className="relative flex items-center justify-center w-full h-40 border-2 border-dashed border-indigo-300 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-all duration-200 ease-in-out">
    <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-500 pointer-events-none">
      <FaImage className="h-8 w-8 mb-2" />
      <p className="text-sm">Click here to upload</p>
    </div>
    <input
      id="profilePicture"
      name="profilePicture"
      type="file"
      accept="image/*"
      onChange={handleFileChange}
      className="absolute inset-0 opacity-0 cursor-pointer"
    />
  </div>

  {uploadProgress > 0 && (
    <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
      <div
        className="bg-indigo-500 h-full transition-all duration-300 ease-in-out"
        style={{ width: `${Math.round(uploadProgress)}%` }}
      ></div>
    </div>
  )}

  {imagePreview && (
    <div className="flex flex-col items-center gap-2 mt-3">
      <img
        src={imagePreview}
        alt="Profile preview"
        className="w-24 h-24 rounded-full object-cover border-2 border-indigo-300 shadow-sm"
      />
      <p className="text-xs text-gray-500">Preview</p>
    </div>
  )}
</div>


                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <input
                            id="terms"
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={() => setTermsAccepted(!termsAccepted)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                            I agree to the <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Terms of Service</a> and <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Privacy Policy</a>
                          </label>
                        </div>
                        {errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms}</p>}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex justify-between items-center">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        <FaChevronLeft className="mr-1.5 h-4 w-4" />
                        Back
                      </button>
                    ) : (
                      <div></div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          {step === 3 ? (
                            'Create Account'
                          ) : (
                            <>
                              Continue
                              <FaChevronRight className="ml-1.5 h-4 w-4" />
                            </>
                          )}
                        </>
                      )}
                    </button>
                    </div>

                    <motion.div
  initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
  animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
  exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
  transition={{ duration: 0.3, ease: "easeInOut" }}
  className={`fixed inset-0 flex items-center justify-center bg-black/30 z-50 ${isModalOpenForEmailVerification ? '' : 'hidden'}`}
>
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 20, opacity: 0 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md mx-4"
  >
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
      <h3 className="text-xl font-bold text-white">Verify Your Email</h3>
    </div>

    <div className="p-6">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      <p className="text-center text-gray-600 mb-6">
        We've sent a 6-digit code to your email. Please enter it below to verify your account.
      </p>

      <div className="mb-6">
        <div className="flex justify-center space-x-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <motion.div
              key={index}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-14"
            >
              <input
                type="text"
                maxLength={1}
                value={otp[index] || ""}
                onChange={(e) => {
                  const newOtp = [...otp];
                  newOtp[index] = e.target.value;
                  setOtp(newOtp.join(""));
                  if (e.target.value && index < 5) {
                    document.getElementById(`otp-input-${index + 1}`)?.focus();
                  }
                }}
                id={`otp-input-${index}`}
                className="w-full h-full text-center text-xl font-semibold border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otp[index] && index > 0) {
                    document.getElementById(`otp-input-${index - 1}`)?.focus();
                  }
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleResendOtp}
          className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
        >
          Resend Code
        </button>
        <span className="text-sm text-gray-500">
          Expires in <span className="font-medium">04:59</span>
        </span>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleVerifyEmail}
        disabled={otp.length < 6}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
          otp.length < 6
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md"
        }`}
      >
        Verify Email
      </motion.button>
    </div>

    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
      <p className="text-center text-sm text-gray-500">
        Didn't receive the code?{" "}
        <button
          onClick={handleResendOtp}
          className="font-medium text-purple-600 hover:text-purple-700 transition-colors"
        >
          Click to resend
        </button>
      </p>
    </div>
  </motion.div>
</motion.div>

                </form>

                {step === 1 && (
                  <div className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                      Sign in instead
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white py-4 mt-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} LinkVita. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default RegistrationForm;