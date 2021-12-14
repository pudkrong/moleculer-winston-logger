module.exports = {
  name: 'loglevel',

  serviceCreating (service, schema) {
    // inject event handler for log level change
    if (!/^\$/.test(schema.name)) {
      schema.events = (schema.events) ? schema.events : {};
      if (Object.keys(schema.events).indexOf('loglevel') === -1) {
        schema.events['log.level'] = (ctx) => {
          const consoleLogger = (this._winston && this._winston.console) ? this._winston.console : null;

          if (ctx.params && ctx.params.service && ctx.params.level) {
            if (ctx.service.name === ctx.params.service) {
              if (consoleLogger) {
                if (!consoleLogger._services) consoleLogger._services = {};
                const mod = {};
                mod[ctx.params.service] = ctx.params.level;
                Object.assign(consoleLogger._services, mod);
                consoleLogger.level = ctx.params.level;
              }
            }
          } else {
            if (consoleLogger) delete consoleLogger._services;
          }
        };
      }
    }
  }
};
