"use strict";

const Moleculer = require('moleculer');
const winston = require('winston');

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "module1",

  // events: {
  //   'log.log-level'(ctx) {
  //     console.log('event inside service', ctx);
  //   }
  // },

	/**
	 * Actions
	 */
	actions: {

		/**
		 * Say a 'Hello' action.
		 *
		 * @returns
		 */
		log: {
			async handler() {
        // console.log(this.logger);
        this.logger.info('Info log message');
        this.logger.warn('Warning log message');
        this.logger.error('Error log message');

				return "done";
			}
		},

		event: {
			async handler(ctx) {
        ctx.broker.broadcast('__log.level', ctx.params);

				return "done";
			}
		},

		/**
		 * Welcome, a username
		 *
		 * @param {String} name - User name
		 */
		setLogLevel: {
			params: {
				name: "string",
        level: "string"
			},
			async handler(ctx) {
        if (ctx.params.name === this.name) {
          const winstonLogger = this.logger.appenders.find(l => {
            return (l instanceof Moleculer.Loggers.Winston);
          });
          if (winstonLogger) {
            const consoleLogger = winstonLogger.winston.transports.find(t => t instanceof winston.transports.Console);
            if (consoleLogger) {
              consoleLogger.level = ctx.params.level;
            }
          }
        }
        return 'done';
			}
		}
	}
};
