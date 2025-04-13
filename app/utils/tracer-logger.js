const colors = require('colors');
const tracer = require('tracer');

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = tracer.colorConsole({
  level: 'log',
  format: [
    '{{timestamp}} {{title}} \t{{method}}[{{file}}:{{line}}] > {{message}}',
    {
      fatal:
        '{{timestamp}} {{title}} \t[{{file}}:{{line}}] > {{message}} \nCall Stack:\n{{stack}}'
    }
  ],
  dateformat: 'HH:MM:ss.L',
  preprocess: function (data) {
    data.title = data.title.toUpperCase();
  },
  filters: {
    log: colors.magenta,
    trace: colors.magenta,
    debug: colors.blue,
    info: colors.green,
    warn: colors.yellow,
    error: [colors.red, colors.bold],
    fatal: [colors.red, colors.bold, colors.underline]
  },
  inspectOpt: {
    showHidden: true, // the object's non-enumerable properties will be shown too
    depth: null // tells inspect how many times to recurse while formatting the object. This is useful for inspecting large complicated objects. Defaults to 2. To make it recurse indefinitely pass null.
  }
});

// const logger = require('tracer').dailyfile({
//   root: '.',
//   maxLogFiles: 10,
//   allLogsFileName: 'myAppName'
// })

// tracer.setLevel(isDevelopment ? 'log' : 'info'); // can't change to a more lower level than the initial level
// tracer.close()

module.exports.logger = logger;

/* example log outputs */
// logger.log('hello');
// logger.trace('hello', 'world');
// logger.debug('hello %s', 'world', 123);
// logger.info('hello %s %d', 'world', 123, { foo: 'bar' });
// logger.warn('hello %s %d %j', 'world', 123, { foo: 'bar' });
// logger.error('hello %s %d %j', 'world', 123, { foo: 'bar' }, [1, 2, 3, 4], Object);
// logger.fatal('Shut down now')
