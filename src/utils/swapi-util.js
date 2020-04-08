const baseUrl = 'https://swapi.co/api';
const rp = require('request-promise-native');
const categories = ['people', 'films', 'starships', 'vehicles', 'species', 'planets'];

function getAllOfCategory(category) {
  const options = { uri: `${baseUrl}/${category}`, json: true };

  return rp(options);
};

async function getAllInAllCategories() {
  const result = [];

  await Promise.all(categories.map(async category => {
    const categoryResults = {};
    categoryResults[category] = await getAllOfCategory(category);
    result.push(categoryResults);
  }));
  
  // Result is an array of objects, each object is the category's results
  return result;
};

function getByIdInCategory(id, category) {
  const options = { uri: `${baseUrl}/${category}/${id}`, json: true };

  return rp(options);
};

function searchInCategory(terms, category) {
  const queryString = _formatQueryParams(terms);
  const options = { uri: `${base}/${category}/?search=${queryString}`, json: true };

  return rp(options);
};

/**
 * @description formats search terms into query string
 * @param {array} terms 
 */
function _formatQueryParams (terms) {
  const key = 'search';
  
  const queryString = terms
    .map(term => {
      return key + '=' + term +('&');
    })
    .join('&')
  return queryString;
}

module.exports = {
  getAllInAllCategories,
  getAllOfCategory,
  getByIdInCategory,
  searchInCategory
}