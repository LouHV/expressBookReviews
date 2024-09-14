const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (isValid(username)) {
    return res.status.json({ message: ' Username already exists' })
  }
  users.push({ username, password })
  return res.status(201).json({
    message: "User registered successfully"
  });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {

  return res.status(200).json({ books });
});

public_users.get('/all', async function (req, res) {
  try {
    // Mô phỏng quá trình lấy dữ liệu sách không đồng bộ
    const getBooks = async (callback) => {
      // Giả lập thời gian chờ trước khi trả về danh sách sách
      setTimeout(() => {
        callback(null, books);
      }, 1000); // Delay 1 giây giả lập async call
    };

    // Sử dụng hàm async với callback
    await getBooks((err, bookList) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching books" });
      }
      return res.status(200).json({ books: bookList });
    });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params
  const book = books[isbn]
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json({
    book
  })
});

// Get book details based on ISBN using Promises
public_users.get('/isbn2/:isbn', function (req, res) {
  const { isbn } = req.params;

  // Tạo một Promise để mô phỏng lấy dữ liệu không đồng bộ
  const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const book = books[isbn];
        if (book) {
          resolve(book);
        } else {
          reject("Book not found");
        }
      }, 1000); // Giả lập 1 giây trễ
    });
  };

  // Sử dụng Promise để lấy sách theo ISBN
  getBookByISBN(isbn)
    .then((book) => {
      return res.status(200).json({ book });
    })
    .catch((error) => {
      return res.status(404).json({ message: error });
    });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const { author } = req.params
  const booksByAuthor = Object.values(books).filter(book => book.author === author)
  if (!booksByAuthor) {
    return res.status(404).json({ message: "No books found by this author" })
  }
  return res.status(200).json({ booksByAuthor })
});

// Get book details based on author using Promises
public_users.get('/author2/:author', function (req, res) {
  const { author } = req.params;

  // Tạo một Promise để mô phỏng lấy dữ liệu không đồng bộ
  const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByAuthor = Object.values(books).filter(book => book.author === author);
        if (booksByAuthor.length > 0) {
          resolve(booksByAuthor);
        } else {
          reject("No books found by this author");
        }
      }, 1000); // Giả lập 1 giây trễ
    });
  };

  // Sử dụng Promise để lấy sách theo tác giả
  getBooksByAuthor(author)
    .then((booksByAuthor) => {
      return res.status(200).json({ booksByAuthor });
    })
    .catch((error) => {
      return res.status(404).json({ message: error });
    });
});



// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const { title } = req.params
  const bookByTitle = Object.values(books).filter(book => book.title === title)
  if (!bookByTitle) {
    return rs.status(404).json({ message: "No books found by this title" })
  }
  return res.status(200).json({ bookByTitle });
});

// Get all books based on title using Promises
public_users.get('/title2/:title', function (req, res) {
  const { title } = req.params;

  // Tạo một Promise để mô phỏng lấy dữ liệu không đồng bộ
  const getBookByTitle = (title) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByTitle = Object.values(books).filter(book => book.title === title);
        if (booksByTitle.length > 0) {
          resolve(booksByTitle);
        } else {
          reject("No books found with this title");
        }
      }, 1000); // Giả lập 1 giây trễ
    });
  };

  // Sử dụng Promise để lấy sách theo tiêu đề
  getBookByTitle(title)
    .then((booksByTitle) => {
      return res.status(200).json({ booksByTitle });
    })
    .catch((error) => {
      return res.status(404).json({ message: error });
    });
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params
  const book = books[isbn]
  if (!book) {
    return req.status(404).json({ message: "No books found by this review" })
  }
  return res.status(200).json({ reviews: book.reviews || [] });
});

module.exports.general = public_users;
