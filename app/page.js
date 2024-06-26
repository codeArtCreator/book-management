'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import BookForm from './components/BookForm';
import BookList from './components/BookList';
import Modal from './components/Modal';
import Pagination from './components/Pagination';
import Login from './components/Login';

const genres = [
  'Fiction',
  'Non-Fiction',
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Biography',
  'History',
  'Romance',
  'Thriller',
  // Add more genres as needed
];

const Home = () => {
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genreFilter, setGenreFilter] = useState('');
  const [token, setToken] = useState(''); // Manage token state
  const [action, setAction] = useState(null); // Track the action type (edit or delete)
  const [actionBook, setActionBook] = useState(null); // Track the book for the action

  useEffect(() => {
    const savedToken = localStorage.getItem('token') || '';
    setToken(savedToken);
  }, []);

  const fetchBooks = async (page = 1) => {
    try {
      const response = await axios.get(`/api/books`, {
        params: { page, searchQuery, genre: genreFilter },
      });
      setBooks(response.data.books);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [searchQuery, genreFilter]);

  const handleAddBook = () => {
    setEditingBook(null);
    setIsModalOpen(true);
  };

  const handleEditBook = (book) => {
    if (token) {
      setEditingBook(book);
      setIsModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
      setAction('edit');
      setActionBook(book);
    }
  };

  const handleDeleteBook = async (book) => {
    if (token) {
      try {
        await axios.delete(`/api/books/${book._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    } else {
      setIsLoginModalOpen(true);
      setAction('delete');
      setActionBook(book);
    }
  };

  const handlePageChange = (page) => {
    fetchBooks(page);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleGenreFilterChange = (e) => {
    setGenreFilter(e.target.value);
  };

  const handleLoginSuccess = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
    setIsLoginModalOpen(false);
    if (action === 'edit') {
      setEditingBook(actionBook);
      setIsModalOpen(true);
    } else if (action === 'delete') {
      handleDeleteBook(actionBook);
    }
    setAction(null);
    setActionBook(null);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Book Management</h1>
        <button
          onClick={handleAddBook}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add New Book
        </button>
      </div>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by title"
          value={searchQuery}
          onChange={handleSearchChange}
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <select
          value={genreFilter}
          onChange={handleGenreFilterChange}
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
      </div>
      <BookList books={books} onEdit={handleEditBook} onDelete={handleDeleteBook} fetchBooks={fetchBooks} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <BookForm book={editingBook} onSubmit={() => setIsModalOpen(false)} fetchBooks={fetchBooks} />
        </Modal>
      )}
      {isLoginModalOpen && (
        <Modal onClose={() => setIsLoginModalOpen(false)}>
          <Login onLoginSuccess={handleLoginSuccess} />
        </Modal>
      )}
    </div>
  );
};

export default Home;
