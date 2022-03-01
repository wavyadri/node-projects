require('dotenv/config');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { verify } = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { hash, compare } = require('bcryptjs');
const { fakeDB } = require('./fakeDB');
const PORT = process.env.PORT;
const {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken,
} = require('./tokens');

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

// 1. register user
server.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. check if user exists
    const user = fakeDB.find((user) => user.email === email);
    if (user) throw new Error('User already exists');
    // 2. if no existing user, hash password
    const hashedPassword = await hash(password, 10);
    // 3. insert user into db
    fakeDB.push({
      id: fakeDB.length,
      email,
      password: hashedPassword,
    });
    console.log(fakeDB);
    res.status(200).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({
      error: `${err.message}`,
    });
  }
});

// 2. login user
server.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. check if user exists
    const user = fakeDB.find((user) => user.email === email);
    if (!user) throw new Error('User does not exists');
    // 2. compare crypted password with provided password
    const valid = await compare(password, user.password);
    if (!valid) throw new Error('Password not correct');
    // 3. if all correct, create refresh access token
    // note: access token = short lifetime, refresh token = long lifetime
    const accesstoken = createAccessToken(user.id);
    const refreshtoken = createRefreshToken(user.id);
    // 4. put refresh token in db
    user.refreshtoken = refreshtoken;
    // 5. send tokens. Refreshtoken as a cookie, Accesstoken as a regular response
    sendRefreshToken(res, refreshtoken);
    sendAccessToken(res, req, accesstoken);
  } catch (err) {
    res.status(400).json({
      error: `${err.message}`,
    });
  }
});

// run server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
