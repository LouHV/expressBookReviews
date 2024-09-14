const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  return users.some(user => user.username === username)
}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  return users.some(user => user.username === username && user.password === password);
}


//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const { username, password } = req.body
  console.log('object :>> ', req.body);
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" })
  }
  const token = jwt.sign({ username }, 'book', { expiresIn: '1h' })
  return res.status(300).json({ 
    message:"Customer successfully logged in",
    token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: "No token provided" })
  }
  jwt.verify(token, 'book', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    

    const { isbn } = req.params;
    const { review } = req.body;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Kiểm tra nếu reviews không phải là mảng, thì chuyển thành mảng
    if (!Array.isArray(books[isbn].reviews)) {
      books[isbn].reviews = [];  // Khởi tạo mảng nếu reviews hiện tại không phải là mảng
    }

    // Thêm review vào danh sách
    books[isbn].reviews.push({ username: decoded.username, review });
    
    return res.status(200).json({ message: "Review added successfully" });
  });
});
// Xóa đánh giá của người dùng đã thêm trước đó
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, 'book', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    
    const { isbn } = req.params;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    const username = decoded.username;

    // Kiểm tra nếu reviews là mảng và chứa review của người dùng này
    if (Array.isArray(books[isbn].reviews)) {
      const reviewIndex = books[isbn].reviews.findIndex(review => review.username === username);

      if (reviewIndex !== -1) {
        // Xóa review của người dùng
        books[isbn].reviews.splice(reviewIndex, 1);
        return res.status(200).json({ message: "Review deleted successfully" });
      } else {
        return res.status(404).json({ message: "Review not found for this user" });
      }
    } else {
      return res.status(404).json({ message: "No reviews found for this book" });
    }
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
