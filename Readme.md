

[Apex Logs](https://apex.sh/logs/) transport for the popular [Winston](https://github.com/winstonjs/winston) Node.js logging framework.

## Installation

```
npm install --save apex-logs-winston
```

## Usage

Logs are buffered in memory and flushed periodically for more efficient ingestion. By default a `maxEntries` of 250, and `flushInterval` of 5 seconds (5000) are used.

```js
const ApexLogsTransport = require('apex-logs-winston')
const winston = require('winston')

const apex = new ApexLogsTransport({
  url: process.env.URL,
  authToken: process.env.AUTH_TOKEN,
  projectId: process.env.PROJECT_ID,
})

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: [apex],
  defaultMeta: { program: 'api', host: 'api-01' }
})

logger.info('User Login', { user: { name: 'Tobi Ferret' } })
```

Here's an example tuning the default buffering options:

```js
const apex = new ApexLogsTransport({
  url: process.env.URL,
  authToken: process.env.AUTH_TOKEN,
  projectId: process.env.PROJECT_ID
  buffer: { maxEntries: 100, flushInterval: 5000 }
})
```

