import React from 'react';
import { Book, BookStatus } from '../types';
import { Calendar, User, Clock, CheckCircle, ArrowRightCircle, Trash2 } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onBorrow: () => void;
  onReturn: () => void;
  onDelete: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onBorrow, onReturn, onDelete }) => {
  const isBorrowed = book.status === BookStatus.BORROWED;

  const getDaysHeld = (dateString?: string | null) => {
    if (!dateString) return 0;
    const start = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
  };

  const daysHeld = isBorrowed ? getDaysHeld(book.borrowed_date) : 0;
  const isOverdue = daysHeld > 14; // Example logic: overdue after 2 weeks

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full relative group">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            {book.genre}
          </span>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isBorrowed 
                ? 'bg-red-100 text-red-800' 
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isBorrowed ? 'На руках' : 'В наличии'}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Удалить книгу"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{book.title}</h3>
        <p className="text-sm text-slate-600 mb-4">{book.author}</p>

        <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-500 mb-4 border-t border-slate-100 pt-3">
          <div><span className="font-semibold">Год:</span> {book.publication_year}</div>
          <div><span className="font-semibold">Стр:</span> {book.page_count}</div>
          <div><span className="font-semibold">Обложка:</span> {book.cover_type}</div>
          <div><span className="font-semibold">Сост:</span> {book.condition_state}</div>
        </div>

        {isBorrowed && (
          <div className={`mt-3 p-3 rounded-lg text-sm ${isOverdue ? 'bg-red-50' : 'bg-blue-50'}`}>
            <div className="flex items-center text-slate-900 font-medium mb-1">
              <User className="w-3 h-3 mr-1.5" />
              {book.last_name} {book.first_name ? `${book.first_name[0]}.` : ''}
            </div>
            <div className="text-slate-600 text-xs mb-2">ID: {book.borrower_phone}</div>
            
            <div className={`flex items-center text-xs font-semibold ${isOverdue ? 'text-red-700' : 'text-blue-700'}`}>
              <Clock className="w-3 h-3 mr-1.5" />
              {daysHeld} дн. у читателя
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-50 px-5 py-3 border-t border-slate-100">
        {isBorrowed ? (
          <button 
            onClick={onReturn}
            className="w-full flex justify-center items-center py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
            Принять возврат
          </button>
        ) : (
          <button 
            onClick={onBorrow}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowRightCircle className="w-4 h-4 mr-2" />
            Выдать книгу
          </button>
        )}
      </div>
    </div>
  );
};