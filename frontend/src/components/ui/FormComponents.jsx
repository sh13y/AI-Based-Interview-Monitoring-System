import React, { useState } from 'react';
import { Controller } from 'react-hook-form';

export const PasswordInput = ({ label, name, control, errors, required = true }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `${label || 'This field'} is required` : false,
          minLength: {
            value: 8,
            message: 'Password must be at least 8 characters'
          },
          maxLength: {
            value: 128,
            message: 'Password must not exceed 128 characters'
          },
          pattern: {
            value: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).*$/,
            message: 'Password must contain uppercase, digit, and special character'
          }
        }}
        render={({ field }) => (
          <div className="relative">
            <input
              {...field}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`w-full px-4 py-2 bg-gray-800 text-gray-300 border rounded-lg focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition placeholder-gray-600 ${
                errors[name] ? 'border-red-400 focus:ring-red-500' : 'border-gray-700 hover:border-gray-600'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 18a9.936 9.936 0 008.515-4.757M9.172 5.104a4 4 0 015.724 5.724M2.485 7.757C1.732 9.014 1.262 10.456 1.262 12c0 4.418 3.582 8 8 8 1.544 0 2.986-.47 4.243-1.243m-7.243-8l2.828 2.829" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        )}
      />
      {errors[name] && (
        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {errors[name].message}
        </p>
      )}
    </div>
  );
};

export const EmailInput = ({ label, name, control, errors, required = true }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `${label || 'Email'} is required` : false,
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
          }
        }}
        render={({ field }) => (
          <input
            {...field}
            type="email"
            placeholder="john@example.com"
            className={`w-full px-4 py-2 bg-gray-800 text-gray-300 border rounded-lg focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition placeholder-gray-600 ${
              errors[name] ? 'border-red-400 focus:ring-red-500' : 'border-gray-700 hover:border-gray-600'
            }`}
          />
        )}
      />
      {errors[name] && (
        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {errors[name].message}
        </p>
      )}
    </div>
  );
};

export const TextInput = ({ label, name, control, errors, required = true, pattern = null, placeholder = '' }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `${label || 'This field'} is required` : false,
          pattern: pattern ? {
            value: pattern.value,
            message: pattern.message
          } : undefined,
          minLength: name.includes('password') ? {
            value: 8,
            message: 'Must be at least 8 characters'
          } : undefined
        }}
        render={({ field }) => (
          <input
            {...field}
            type="text"
            placeholder={placeholder}
            className={`w-full px-4 py-2 bg-gray-800 text-gray-300 border rounded-lg focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition placeholder-gray-600 ${
              errors[name] ? 'border-red-400 focus:ring-red-500' : 'border-gray-700 hover:border-gray-600'
            }`}
          />
        )}
      />
      {errors[name] && (
        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {errors[name].message}
        </p>
      )}
    </div>
  );
};

export const FormError = ({ message }) => {
  if (!message) return null;
  return (
    <div className="p-3.5 bg-red-900/30 border border-red-700/50 text-red-300 rounded-lg flex items-start gap-3 mb-4">
      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <span className="text-sm">{message}</span>
    </div>
  );
};

export const FileUploadInput = ({ label, name, control, errors, onFileChange }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    onChange(reader.result);
                    onFileChange?.(reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
              id={name}
            />
            <label htmlFor={name} className="cursor-pointer">
              <div className="sr-only">Upload file</div>
            </label>
          </div>
        )}
      />
      {errors[name] && (
        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {errors[name].message}
        </p>
      )}
    </div>
  );
};
