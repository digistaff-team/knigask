import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  Users, 
  Search, 
  RefreshCw, 
  PlusCircle, 
  Library,
  BookPlus,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';
import { Book, Reader, ReaderFormData, BookStatus, BookFormData } from './types';
import { BookCard } from './components/BookCard';
import { ReaderForm } from './components/ReaderForm';
import { AddBookForm } from './components/AddBookForm';
import { BorrowModal } from './components/BorrowModal';
import { Toast } from './components/Toast';

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'register'>('catalog');
  const [books, setBooks] = useState<Book[]>([]);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ field: 'title' | 'author' | 'publication_year', direction: 'asc' | 'desc' }>({ 
    field: 'title', 
    direction: 'asc' 
  });
  
  // Modal State
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  
  // Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- API ---

  // NOTE: For local development with a proxy, this might be relative. 
  // For the specific VPS deploy structure, ensures URLs are constructed correctly.
  const getApiUrl = (path: string) => {
    // Determine base URL based on environment if needed, defaulting to relative for proxy
    return `/api${path}`;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [booksRes, readersRes] = await Promise.all([
        fetch(getApiUrl('/books')),
        fetch(getApiUrl('/readers'))
      ]);

      if (!booksRes.ok || !readersRes.ok) throw new Error('Ошибка загрузки данных');

      const booksData = await booksRes.json();
      const readersData = await readersRes.json();

      setBooks(booksData);
      setReaders(readersData);
    } catch (err: any) {
      showToast(err.message || 'Ошибка соединения', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRegisterReader = async (data: ReaderFormData) => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/readers'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Ошибка регистрации');

      showToast(`Читатель ${data.lastName} зарегистрирован`, 'success');
      fetchData();
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (data: BookFormData) => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/books'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Ошибка добавления книги');

      showToast(`Книга "${data.title}" добавлена`, 'success');
      fetchData();
      setIsAddBookModalOpen(false); // Close modal on success
      return true;
    } catch (err: any) {
      showToast(err.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту книгу? Это действие необратимо.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(getApiUrl(`/books/${id}`), {
        method: 'DELETE',
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Ошибка удаления книги');

      showToast('Книга удалена', 'success');
      setBooks(prevBooks => prevBooks.filter(book => book.id !== id));
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId: number, phone: string) => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/borrow'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, phone })
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Ошибка выдачи');

      showToast('Книга успешно выдана', 'success');
      setSelectedBook(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (bookId: number) => {
    if (!confirm('Подтвердить возврат книги в библиотеку?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/return'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId })
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Ошибка возврата');

      showToast('Книга возвращена', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter and Sort books
  const getProcessedBooks = () => {
    let result = books.filter(b => 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.borrower_phone && b.borrower_phone.includes(searchQuery))
    );

    return result.sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const processedBooks = getProcessedBooks();

  const stats = {
    total: books.length,
    borrowed: books.filter(b => b.status === BookStatus.BORROWED).length,
    readers: readers.length
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'catalog':
        return (
          <div className="space-y-6">
            {/* Search and Sort Bar */}
            <div className="flex flex-col xl:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Поиск по названию, автору или телефону читателя..."
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2 shrink-0">
                <select 
                  value={sortConfig.field}
                  onChange={(e) => setSortConfig(prev => ({ ...prev, field: e.target.value as any }))}
                  className="block pl-3 pr-8 py-3 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-xl border bg-white shadow-sm"
                >
                  <option value="title">По названию</option>
                  <option value="author">По автору</option>
                  <option value="publication_year">По году</option>
                </select>

                <button
                  onClick={() => setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                  className="inline-flex items-center justify-center px-3 py-3 border border-slate-300 shadow-sm text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  title={sortConfig.direction === 'asc' ? 'По возрастанию' : 'По убыванию'}
                >
                  {sortConfig.direction === 'asc' ? <ArrowDown className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
                </button>

                <button 
                  onClick={fetchData}
                  className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>

                <button 
                  onClick={() => setIsAddBookModalOpen(true)}
                  className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Добавить книгу
                </button>
              </div>
            </div>

            {/* Grid */}
            {processedBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedBooks.map(book => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    onBorrow={() => setSelectedBook(book)}
                    onReturn={() => handleReturn(book.id)}
                    onDelete={() => handleDeleteBook(book.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">Книги не найдены</h3>
                <p className="mt-1 text-sm text-slate-500">Попробуйте изменить поисковый запрос.</p>
              </div>
            )}
          </div>
        );
      case 'register':
        return (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
              <div className="px-6 py-8 border-b border-slate-100">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <PlusCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-bold text-slate-900">Регистрация читателя</h2>
                    <p className="text-sm text-slate-500">Добавьте нового пользователя в базу данных библиотеки</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50">
                <ReaderForm onSubmit={handleRegisterReader} isLoading={loading} />
              </div>
              
              {/* Recent Readers List */}
              <div className="px-6 py-6 border-t border-slate-100 bg-white">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Последние регистрации</h3>
                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-slate-100">
                    {readers.slice(0, 5).map(reader => (
                      <li key={reader.phone} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                              {reader.first_name[0]}{reader.last_name[0]}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {reader.last_name} {reader.first_name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              ID: {reader.phone} • Рег: {reader.registration_date}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <Library className="h-8 w-8 text-blue-200" />
              <div>
                <h1 className="text-xl font-bold leading-none">Книги</h1>
                <span className="text-xs text-blue-200 opacity-80">Сказочного Края</span>
              </div>
            </div>
            
            <nav className="flex space-x-1 bg-blue-800/50 p-1 rounded-xl overflow-x-auto">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'catalog' 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-blue-100 hover:bg-blue-600'
                }`}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Каталог
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'register' 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-blue-100 hover:bg-blue-600'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Читатели
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Всего книг</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Выдано</p>
              <p className="text-2xl font-bold text-amber-600">{stats.borrowed}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-full text-amber-600">
              <RefreshCw className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Читателей</p>
              <p className="text-2xl font-bold text-green-600">{stats.readers}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full text-green-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {renderContent()}
      </main>

      {/* Modals */}
      {selectedBook && (
        <BorrowModal 
          book={selectedBook} 
          readers={readers}
          onClose={() => setSelectedBook(null)}
          onConfirm={(phone) => handleBorrow(selectedBook.id, phone)}
          loading={loading}
        />
      )}

      {/* Add Book Modal */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsAddBookModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <BookPlus className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Новая книга
                    </h3>
                  </div>
                  <button onClick={() => setIsAddBookModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 bg-slate-50 max-h-[75vh] overflow-y-auto">
                <AddBookForm 
                  onSubmit={handleAddBook} 
                  onCancel={() => setIsAddBookModalOpen(false)} 
                  isLoading={loading} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}