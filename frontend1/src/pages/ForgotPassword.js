import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP+New Password, 3: Done
  const [form, setForm] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'OTP sent');
        setStep(2);
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: form.otp, newPassword: form.newPassword })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Password reset successfully');
        setStep(3);
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (err) {
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {step === 1 && (
          <form onSubmit={sendOTP} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Forgot Password</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input type="email" name="email" required value={form.email} onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50">
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
            <div className="text-center text-sm">
              <Link to="/login" className="text-orange-600 hover:underline">Back to login</Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={resetPassword} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Verify & Reset</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">OTP</label>
              <input type="text" name="otp" maxLength="6" required value={form.otp} onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
              <input type="password" name="newPassword" required value={form.newPassword} onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
              <input type="password" name="confirmPassword" required value={form.confirmPassword} onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <div className="text-center text-sm">
              <button type="button" onClick={() => setStep(1)} className="text-orange-600 hover:underline">Back</button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Password Reset Successful</h2>
            <Link to="/login" className="inline-block py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700">Go to Login</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;


