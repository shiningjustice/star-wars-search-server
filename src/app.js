'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');

const authRouter = require('./auth/auth-router');
const dataRouter = require('./data/data-router');
const userRouter = require('./user/user-router');
const errorHandler = require('./middleware/error-handler');

const app = express(); 

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common'; 

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, world!');
});
app.use('/api/auth', authRouter);
app.use('/api/data', dataRouter);
app.use('/api/user', userRouter);

app.use(errorHandler);

module.exports = app;