import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const base = api.defaults.baseURL || '';
      const hasApi = /\/api\/?$/.test(base);
      const url = `${hasApi ? '' : '/api'}/admin-auth/send-otp`;
      const res = await api.post(url, formData);
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Admin login failed');
      }
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Admin login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">Admin Sign In</h2>
          <p className="mt-2 text-center text-sm text-gray-500">Use admin credentials only</p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <div className="mt-1 flex items-center gap-2">
                  <input className="input-field flex-1" type="email" required value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Password</label>
                <div className="mt-1 relative">
                  <input className="input-field w-full pr-10" type={showPassword?'text':'password'} required value={formData.password} onChange={e=>setFormData({...formData,password:e.target.value})} />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={()=>setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <button disabled={loading} className="w-full py-2 px-4 rounded bg-orange-600 text-white disabled:opacity-50">{loading?'Sending...':'Send OTP'}</button>
            </form>
            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-orange-600">Login as User</Link>
            </div>
            <div className="mt-6 text-center">
              <button onClick={()=>navigate('/')} className="text-orange-600 flex items-center justify-center mx-auto">
                <FaArrowLeft className="mr-2" /> Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Enter 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const base = api.defaults.baseURL || '';
      const hasApi = /\/api\/?$/.test(base);
      const url = `${hasApi ? '' : '/api'}/admin-auth/verify-otp`;
      const res = await api.post(url, { email: formData.email, otp });
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'OTP verification failed');
      }
      const { token } = res.data.data;
      localStorage.setItem('adminToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      toast.success('Welcome, admin');
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'OTP verification failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">Verify Admin Login</h2>
        <p className="mt-2 text-center text-sm text-gray-500">Enter the 6-digit code</p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleVerify}>
            <div>
              <label className="block text-sm font-medium">OTP</label>
              <input className="input-field text-center text-2xl tracking-widest" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} />
            </div>
            <button disabled={loading} className="w-full py-2 px-4 rounded bg-orange-600 text-white disabled:opacity-50">{loading?'Verifying...':'Verify & Sign In'}</button>
          </form>
          <div className="mt-4 text-center">
            <button onClick={()=>setStep(1)} className="text-sm text-orange-600">Back to credentials</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;


