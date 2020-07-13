const ApexLogsTransport = require('./')
const winston = require('winston')

const apex = new ApexLogsTransport({
  url: process.env.URL,
  authToken: process.env.AUTH_TOKEN,
  projectId: process.env.PROJECT_ID,
  buffer: { maxEntries: 200 }
})

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: [apex],
  defaultMeta: { program: 'api', host: 'api-01' }
})

logger.info('User Login', { user: { id: 'tobi', name: 'Tobi Ferret' } })
logger.warning('Access denied')
logger.crit('Something exploded', { error: new Error('boom') })

// setInterval(_ => {
//   logger.info('Hello World from Winston')
// }, 250)
logger.end()