const SavedDataService = {
  getItemsSavedData(db, table, user_id, data_id) {
    return db(table)
      .select('*')
      .where({ user_id })
      .where({ id: data_id })
      .first()
  },
  getCategorysSavedData(db, table, user_id) {
    return db(table)
      .select('*')
      .where({ user_id })
  },
  saveNewData(db, table, dataToSave) {
    return db
      .insert(dataToSave)
      .into(table)
      .returning('*')
      .then((rows) => {
        return rows[0];
      })
  },
  updateSavedData(db, table, user_id, data_id, updatedFields) {
    return db(table)
      .where({ user_id })
      .where({ id: data_id })
      .update({ ...updatedFields })
  },
  deleteSavedData(db, table, user_id, data_id) {
    return db(table)
      .where({ user_id })
      .where({ id: data_id })
      .del();
  },
};

module.exports = SavedDataService;