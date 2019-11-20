
const RequestorsService = {

  addNewRequest(db, newRequestor){
    return db
      .into('requestors')
      .insert(newRequestor)
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  }

}

module.exports = RequestorsService;