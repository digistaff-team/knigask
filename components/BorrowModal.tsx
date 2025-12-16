import React, { useState, useEffect } from 'react';
import { Book, Reader } from '../types';
import { X, Search } from 'lucide-react';

interface BorrowModalProps {
  book: Book;
  readers: Reader[];
  onClose: () => void;
  onConfirm: (phone: string) => void;
  loading: boolean;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({ book, readers, onClose, onConfirm, loading }) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [filteredReaders, setFilteredReaders] = useState<Reader[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Simple autocomplete logic
  useEffect(() => {
    if (phoneInput.length > 1) {
      const matches = readers.filter(r => 
        r.phone.includes(phoneInput) || 
        r.last_name.toLowerCase().includes(phoneInput.toLowerCase())
      );
      setFilteredReaders(matches.slice(0, 3));
    } else {
      setFilteredReaders([]);
    }
  }, [phoneInput, readers]);

  const handleSubmit = () => {
    if (!phoneInput) return;

    // Validation: Check if it matches 7XXXXXXXXXX format
    const phoneRegex = /^7\d{10}$/;
    if (!phoneRegex.test(phoneInput)) {
      setError('Введите корректный ID (7XXXXXXXXXX) или выберите из списка');
      return;
    }

    onConfirm(phoneInput);
  };

  const selectReader = (phone: string) => {
    setPhoneInput(phone);
    setFilteredReaders([]);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneInput(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Выдача книги
                  </h3>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-100">
                  <p className="text-sm font-bold text-slate-900">{book.title}</p>
                  <p className="text-sm text-slate-500">{book.author}</p>
                </div>

                <div className="relative">
                  <label htmlFor="borrower-phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Поиск читателя (телефон или фамилия)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="borrower-phone"
                      id="borrower-phone"
                      autoComplete="off"
                      className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm rounded-md p-3 border ${
                        error ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="7999..."
                      value={phoneInput}
                      onChange={handleInputChange}
                    />
                  </div>
                  {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                  
                  {/* Autocomplete Dropdown */}
                  {filteredReaders.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {filteredReaders.map((reader) => (
                        <li 
                          key={reader.phone}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-gray-900"
                          onClick={() => selectReader(reader.phone)}
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">{reader.last_name} {reader.first_name}</span>
                            <span className="text-gray-500">{reader.phone}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              disabled={loading || !phoneInput}
              onClick={handleSubmit}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${loading || !phoneInput ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Обработка...' : 'Подтвердить выдачу'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};