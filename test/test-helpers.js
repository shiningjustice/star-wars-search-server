const knex = require('knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../src/config');

/**
 * create a knex instance connected to postgres
 * @returns {knex instance}
 */
function makeKnexInstance() {
  return knex({
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL,
  });
}

/**
 * @const {array} - user objects
 */
const usersArray = [
  {
    id: 1,
    username: 'test-user-1',
    password: 'password',
    first_name: 'Test user 1',
  },
  {
    id: 2,
    username: 'test-user-2',
    password: 'password',
    first_name: 'Test user 2',
    side: 'dark-side'
  },
];


/**
 * @const {array} of categories of data, type string (NOT saved objects)
 */
const categories = ['people', 'films', 'starships', 'vehicles', 'species', 'planets'];

/**
 * @returns seeds according to available ids for category
 * @param {string} category
 */
function createSavedSeeds(category) {
  if (['starships', 'species'].includes(category)) {
    return [
      {
        id: 5,
        user_id: 1, 
        favorited: true, 
        notes: 'test notes',
      }, 
      {
        id: 9, 
        user_id: 1, 
        favorited: true,
        notes: '', 
      }, 
      {
        id: 10, 
        user_id: 1, 
        favorited: false,
        notes: 'another test notes'
      }
    ];
  } 
  if (category === 'vehicles') {
    return [
      {
        id: 4,
        user_id: 1, 
        favorited: true, 
        notes: 'test notes',
      }, 
      {
        id: 6, 
        user_id: 1, 
        favorited: true,
        notes: '', 
      }, 
      {
        id: 7, 
        user_id: 1, 
        favorited: false,
        notes: 'another test notes'
      }
    ];
  }
  return [
    {
      id: 2,
      user_id: 1, 
      favorited: true, 
      notes: 'test notes',
    }, 
    {
      id: 3, 
      user_id: 1, 
      favorited: true,
      notes: '', 
    }, 
    {
      id: 4, 
      user_id: 1, 
      favorited: false,
      notes: 'another test notes'
    }
  ]
} 


/**
 * make a bearer token with jwt for authorization header
 * @param {object} user - contains `id`, `username`
 * @param {string} secret - used to create the JWT, default provided
 * @returns {string} - for HTTP authorization header
 */
function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id, first_name: user.first_name }, secret, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}


/**
 * remove data from tables and reset sequences for SERIAL id fields
 * @param {knex instance} db
 * @returns {Promise} - when tables are cleared
 */
function cleanTables(db) {
  return db.transaction((trx) =>
    trx
      .raw(
        `TRUNCATE
        "saved_people",
        "saved_films",
        "saved_starships",
        "saved_vehicles",
        "saved_species",
        "saved_planets",
        "user"`
      )
  );
}

/**
 * insert users into db with bcrypted passwords and update sequence
 * @param {knex instance} db
 * @param {array} users - array of user objects for insertion
 * @returns {Promise} - when users table seeded
 */
function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db.transaction(async (trx) => {
    await trx.into('user').insert(preppedUsers);

    await trx.raw(`SELECT setval('user_id_seq', ?)`, [users[users.length - 1].id]);
  });
}

/**
 * insert category data into db
 * @param {knex instance} db
 * @param {string} category - formats to be `saved_${category}` before querying db
 * @param {array} data - data to be saved
 * @returns {Promise} - when specified category table is seeded
 */
function seedCategory(db, category, data) {
  return db.transaction(async (trx) => {
    await trx.into(`saved_${category}`).insert(data);
  });
}

module.exports = {
  makeKnexInstance,
  usersArray,
  categories,
  createSavedSeeds,
  makeAuthHeader,
  cleanTables,
  seedUsers, 
  seedCategory
}