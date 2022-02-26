const express = require('express');
const path = require('path');
const cors = require('cors');

const logger = require('./services/logger');

const routes = require('./routes');

require('dotenv').config();

const app = express();

// Don't reveal this information...
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  const { baseUrl, hostname, ip, method, originalUrl } = req;
  const log = {
    baseUrl,
    hostname,
    ip,
    method,
    status: res.statusCode,
    timestamp: new Date(),
    url: originalUrl,
    userAgent: req.headers['user-agent'],
  };
  logger.info('Request Logging', log);
  next();
});

app.use('/', express.static(path.join(__dirname, '../web/dist')));
app.use('/api', routes);
app.use('/favicon.ico', express.static(path.join(__dirname, './static/favicon.ico')));

const port = process.env.PORT || 8000;
app.listen(process.env.PORT || 8000, () => {
  console.info(`Listening on ${port}`);
});
