const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(__dirname, '../db/budget.db'), {
  verbose: console.log,
});

function getDb() {
  return db;
}

module.exports = {
  getDb,
};