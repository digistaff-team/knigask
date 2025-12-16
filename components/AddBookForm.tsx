import React, { useState } from 'react';
import { BookFormData, CoverType, ConditionState, BookStatus } from '../types';
import { BookPlus, Save, X } from 'lucide-react';

interface AddBookFormProps {
  onSubmit: (data: BookFormData) => Promise<boolean>;
  onCancel?: () => void;
  isLoading: boolean;
}

export const AddBookForm: React.FC<AddBookFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    coverType: CoverType.HARD,
    publicationYear: new Date().getFullYear(),
    genre: '',
    pageCount: 0,
    conditionState: ConditionState.NEW,
    status: BookStatus.AVAILABLE
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'publicationYear' || name === 'pageCount' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    if (success) {
      // Reset form to defaults
      setFormData({
        title: '',
        author: '',
        coverType: CoverType.HARD,
        publicationYear: new Date().getFullYear(),
        genre: '',
        pageCount: 0,
        conditionState: ConditionState.NEW,
        status: BookStatus.AVAILABLE
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">Название книги</label>
          <div className="mt-1">
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-3 border"
              placeholder="Например: Война и мир"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="author" className="block text-sm font-medium text-slate-700">Автор</label>
          <div className="mt-1">
            <input
              type="text"
              name="author"
              id="author"
              required
              value={formData.author}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-3 border"
              placeholder="Лев Толстой"
            />
          </div>
        </div>

        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-slate-700">Жанр</label>
          <div className="mt-1">
            <input
              type="text"
              name="genre"
              id="genre"
              required
              value={formData.genre}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-3 border"
              placeholder="Роман"
            />
          </div>
        </div>

        <div>
          <label htmlFor="publicationYear" className="block text-sm font-medium text-slate-700">Год издания</label>
          <div className="mt-1">
            <input
              type="number"
              name="publicationYear"
              id="publicationYear"
              required
              min="1800"
              max={new Date().getFullYear() + 1}
              value={formData.publicationYear}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-3 border"
            />
          </div>
        </div>

        <div>
          <label htmlFor="pageCount" className="block text-sm font-medium text-slate-700">Количество страниц</label>
          <div className="mt-1">
            <input
              type="number"
              name="pageCount"
              id="pageCount"
              required
              min="1"
              value={formData.pageCount || ''}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-3 border"
            />
          </div>
        </div>

        <div>
          <label htmlFor="coverType" className="block text-sm font-medium text-slate-700">Тип обложки</label>
          <div className="mt-1">
            <select
              id="coverType"
              name="coverType"
              value={formData.coverType}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-3 border bg-white"
            >
              {Object.values(CoverType).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="conditionState" className="block text-sm font-medium text-slate-700">Состояние</label>
          <div className="mt-1">
            <select
              id="conditionState"
              name="conditionState"
              value={formData.conditionState}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-3 border bg-white"
            >
              {Object.values(ConditionState).map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Обычно новую книгу добавляют как "свободную", но требование просило поле статуса */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">Статус</label>
          <div className="mt-1">
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-3 border bg-white"
            >
              {Object.values(BookStatus).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      <div className="pt-4 flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-1/3 flex justify-center items-center py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
          >
            Отмена
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
           {isLoading ? (
             'Сохранение...'
           ) : (
             <>
               <Save className="w-5 h-5 mr-2" />
               Добавить книгу
             </>
           )}
        </button>
      </div>
    </form>
  );
};