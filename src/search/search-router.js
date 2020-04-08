const express = require('express');
const { sanitizeSavedData } = require('../helpers');

const jsonParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');
const swapiUtil = require('../utils/swapi-util');

const searchRouter = express.Router();
const savedFields = ['favorited', 'notes'];

searchRouter
  .use(requireAuth)

searchRouter
  .

