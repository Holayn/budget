const Database = require('better-sqlite3');
const moment = require('moment');
const path = require('path');

require('dotenv').config();

const DB_DATE_FORMAT = 'yyyy-MM-DD';

const db = new Database(path.resolve(__dirname, process.env.DB_PATH));

const DB_TYPES = {
  BOOLEAN: 'BOOLEAN',
  DATE: 'DATE',
}

class DB {
  static tableName = null;
  static schema = {};

  static transaction(cb) {
    return db.transaction(cb);
  }

  static update(properties) {
    db.transaction(properties => {
      const setStatements = [];
      const propertiesToUpdate = {};
      Object.keys(properties).forEach(property => {
        if (properties[property] === undefined) { 
          return; 
        }
        else {
          if (this.schema[property] === DB_TYPES.BOOLEAN) { 
            propertiesToUpdate[property] = properties[property] ? 1 : 0; 
          }
          else if (this.schema[property] === DB_TYPES.DATE) { 
            propertiesToUpdate[property] = moment(properties[property]).format(DB_DATE_FORMAT);
          }
          else {
            propertiesToUpdate[property] = properties[property];
          }

          if (property !== 'id') {
            setStatements.push(`${camelToSnakeCase(property)} = @${property}`);
          }
        }
      });

      const stmt = db.prepare(`UPDATE ${this.tableName} SET ${setStatements.join(', ')} WHERE id = @id`);
      stmt.run(propertiesToUpdate);
    })(properties);
  }

  static read(id) {
    const stmt = db.prepare(`SELECT * FROM ${this.tableName} WHERE id = @id`);
    return stmt.get({
      id,
    });
  }

  static insert(properties) {
    db.transaction(properties => {
      const propertiesToInsert = {};
      Object.keys(properties).forEach(property => {
        if (property === 'id' || properties[property] === undefined) { 
          return; 
        }
        else {
          if (this.schema[property] === DB_TYPES.BOOLEAN) { 
            propertiesToInsert[property] = properties[property] ? 1 : 0; 
          }
          else if (this.schema[property] === DB_TYPES.DATE) { 
            propertiesToInsert[property] = moment(properties[property]).format(DB_DATE_FORMAT); 
          }
          else {
            propertiesToInsert[property] = properties[property];
          }
        }
      });

      const stmt = db.prepare(`INSERT INTO ${this.tableName} (${Object.keys(propertiesToInsert).join(', ')}) VALUES (${Object.keys(propertiesToInsert).map(p => `@${p}`).join(', ')})`);
      stmt.run(propertiesToInsert);
    })(properties);
  }
}

function getDb() {
  return db;
}

function camelToSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

module.exports = {
  DB,
  DB_DATE_FORMAT,
  DB_TYPES,
  getDb,
};