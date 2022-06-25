const { parse } = require('../services/expense-parser.js');

async function go() {
    await parse();
    process.exit();
}

go();
