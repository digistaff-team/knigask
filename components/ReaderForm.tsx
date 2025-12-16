import React, { useState } from 'react';
import { ReaderFormData } from '../types';

interface ReaderFormProps {
  onSubmit: (data: ReaderFormData) => Promise<boolean>;
  isLoading: boolean;
}

export const ReaderForm: React.FC<ReaderFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ReaderFormData>({
    phone: '',
    firstName: '',
    lastName: '',
    dob: ''
  });
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const validatePhone = (phone: string) => {
    const phoneRegex = /^7\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return 'Номер телефона должен начинаться с 7 и содержать 11 цифр';
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      setPhoneError(null);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validatePhone(formData.phone);
    if (error) {
      setPhoneError(error);
      return;
    }

    const success = await onSubmit(formData);
    if (success) {
      setFormData({ phone: '', firstName: '', lastName: '', dob: '' });
      setPhoneError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Номер телефона (ID)</label>
        <div className="mt-1">
          <input
            type="text"
            name="phone"
            id="phone"
            required
            placeholder="79001234567"
            value={formData.phone}
            onChange={handleChange}
            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md p-3 border ${
              phoneError ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'
            }`}
          />
        </div>
        {phoneError ? (
          <p className="mt-1 text-xs text-red-600">{phoneError}</p>
        ) : (
          <p className="mt-1 text-xs text-slate-500">Служит уникальным идентификатором читателя. Формат: 7XXXXXXXXXX</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">Имя</label>
          <div className="mt-1">
            <input
              type="text"
              name="firstName"
              id="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-3 border"
            />
          </div>
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Фамилия</label>
          <div className="mt-1">
            <input
              type="text"
              name="lastName"
              id="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-3 border"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="dob" className="block text-sm font-medium text-slate-700">Дата рождения</label>
        <div className="mt-1">
          <input
            type="date"
            name="dob"
            id="dob"
            required
            value={formData.dob}
            onChange={handleChange}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-3 border"
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Регистрация...' : 'Зарегистрировать читателя'}
        </button>
      </div>
    </form>
  );
};