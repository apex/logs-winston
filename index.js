
const debug = require('debug')('apex-logs-winston')
const Transport = require('winston-transport')
const { Client } = require('apex-logs')
const Buffer = require('./buffer')

// levels is a map of valid Winston to Apex Logs levels.
const levels = {
  warn: 'warning',
  verbose: 'debug',
  silly: 'debug',
  emerg: 'emergency',
  crit: 'critical',
  help: 'info',
  data: 'info',
  prompt: 'info',
  http: 'info',
  input: 'info'
}

/**
 * ApexLogsTransport is the Apex Logs transport.
 */

exports = module.exports = class ApexLogsTransport extends Transport {

  /**
   * Initialize with the given config:
   * 
   * - `url`: Apex Logs instance endpoint
   * - `authToken`: API auth token
   * - `projectId`: Project id
   * - `buffer`: Options for buffering
   *   - `maxEntries`: The maximum number of entries before flushing (defaults to 250)
   *   - `flushInterval`: The flush interval in milliseconds (defaults to 15,000)
   * - `json`: Enable JSON output for Heroku or AWS Lambda
   */

  constructor({ url, authToken, projectId, json, buffer = {}, ...options }) {
    super(options)
    this.projectId = projectId
    this.client = new Client({ url, authToken })
    this.json = json
    this.buffer = new Buffer({
      onFlush: this.onFlush.bind(this),
      onError: this.onError.bind(this),
      ...buffer
    })
  }

  /**
   * Log handler, buffer the event.
   */

  async log(info, callback) {
    const { level, message, ...fields } = info
    
    // normalize level
    const l = levels[level] || level

    // error details
    if (fields.error instanceof Error) {
      fields.error = fields.error.stack || fields.error.toString()
    }

    // event
    const e = {
      timestamp: new Date,
      level: l,
      message,
      fields
    }

    // json output
    if (this.json) {
      console.log(JSON.stringify(e))
      return callback()
    }

    // buffer event
    this.buffer.push(e)

    callback()
  }

  /**
   * End handler, close the buffer.
   */

  async end(args) {
    debug('closing')
    await this.buffer.close()
    super.end(args)
  }

  /**
   * Handle flushing.
   */

  async onFlush(events) {
    await this.client.addEvents({
      project_id: this.projectId,
      events
    })
  }

  /**
   * Handle errors.
   */

  async onError(error) {
    // TODO: maybe delegate here
    console.error('apex/logs-winston: error flushing logs: %s', error)
  }
}

exports.JSON = class ApexLogsJSONTransport extends Transport {

} 