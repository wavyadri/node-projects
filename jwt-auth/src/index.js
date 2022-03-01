require('dotenv/config');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { verify } = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { hash, compare } = require('bcryptjs');
const PORT = process.env.PORT;

// 1. register user
// 2. login user
// 3. logout user
// 4. setup protected route
// 5. get new access token with a refresh token

const server = express();

// middleware
server.use(cookieParser());
server.use(cors({ origin: 'http://localhost:4000', credentials: true }));
// read body data
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// run server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// 1.
server.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // check user exists
    const hashedPassword = await hash(password, 10);
    console.log(hashedPassword);
  } catch (err) {
    console.error(err);
  }
});
