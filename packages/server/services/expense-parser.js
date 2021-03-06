const csv = require('csv-parser');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
const CronJob = require('cron').CronJob;

const { ExpenseDB } = require('./db/expense.js');
const { addExpense } = require('./expenser.js');

const MAPPINGS = '../configs/mappings.json';
const CSV_DIRECTORY = '../csv';

// Parse any available spreadsheets every 15 minutes
new CronJob('15 * * * *', () => {
  parse();
}).start();

async function parse() {
  const filesToParse = findFiles();
  for (let i = 0; i < filesToParse.length; i++) {
    const fileToParse = filesToParse[i];
    try {
      await parseFile(fileToParse);
    } catch (e) {
      console.error('Something went wrong parsing an expenses file');
    }
    // fs.unlinkSync(path.resolve(__dirname, fileToParse.path));
  }
}

function findFiles() {
  const filesToParse = [];

  fs.readdirSync(path.resolve(__dirname, CSV_DIRECTORY), { withFileTypes: true }).filter(d => d.isDirectory()).forEach(d => {
    // citi, amex, etc.
    const directoryName = d.name;
    fs.readdirSync(path.resolve(__dirname, `${CSV_DIRECTORY}/${directoryName}`)).forEach(f => {
      filesToParse.push({
        path: `${CSV_DIRECTORY}/${directoryName}/${f}`,
        source: directoryName,
        filename: f,
      });
    });
  });

  return filesToParse;
}

function parseFile({ path: filePath, source }) {
  const mappings = JSON.parse(fs.readFileSync(path.resolve(__dirname, MAPPINGS)));
  const rows = [];

  return new Promise((resolve) => {
    console.log(`Reading: ${path.resolve(__dirname, filePath)}`);
    const csvParserOptions = {};
    if (source === 'manual') {
      csvParserOptions.separator = '\t';
      csvParserOptions.headers = false;
    }
    fs.createReadStream(path.resolve(__dirname, filePath))
      .pipe(csv(csvParserOptions))
      .on('data', data => rows.push(data))
      .on('end', async () => {
        console.info(`---Parsed ${filePath}---`);
        // TODO: handle expenses that have the same date, amount, and description, but are not duplicates.

        // Insert records into DB
        // Prompt user for category of expense
        //  - if name of expense hasn't been seen before
        const mapping = mappings[source];
        for (let i=0; i<rows.length; i++) {
          const row = rows[i];

          if (Array.isArray(mapping.amount && mapping.amount.length > 2)) {
            throw 'Unhandled case in amount config';
          }

          const rawAmount = Array.isArray(mapping.amount) ? row[mapping.amount[0]] + row[mapping.amount[1]] : row[mapping.amount];
          const amount = parseFloat(rawAmount.replace(/,|\$/g, ''));
          const date = moment(row[mapping.date], 'MM/DD/YYYY');
          if (!date.isValid()) {
            console.error('INVALID DATE ON ENTRY');
            return;
          }
          const description = row[mapping.description];

          let skip = false;
          mapping.skip?.forEach(s => {
            if (s.includes(description)) {
              skip = true;
            } else if (description.includes(s)) {
              skip = true;
            }
          });

          if (skip) {
            continue;
          }

          if (ExpenseDB.getByAmountDateDescription({ amount, date, description })) {
            console.log(`EXISTING ENTRY FOUND: ${description} (${amount}) on ${date}`);
            continue;
          }

          let type;
          const existingExpenseForDescription = ExpenseDB.getByDescription(description);
          if (existingExpenseForDescription) {
            type = existingExpenseForDescription.type;
          } else {
            type = 'UNKNOWN';
          }

          addExpense({
            amount,
            date,
            description,
            details: null,
            type,
          });
        }

        resolve();
      });
  });
}

module.exports = {
  parse,
};