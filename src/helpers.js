const xss = require('xss');

/**
 * @param {object} data 
 * @returns {object} sanitized object
 */
const sanitizeSavedData = (data) => ({
  id: data.id,
  user_id: data.user_id,
  favorited: data.favorited,
  notes: xss(data.notes)
});

module.exports = {
  sanitizeSavedData
};