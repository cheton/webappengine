import cluster from 'cluster';
import util from 'util';
import winston from 'winston';
import settings from '../config/settings';

const meta = () => {
    let meta = {};
    if (cluster.isMaster) {
        meta.id = 0;
        meta.pid = process.pid;
    } else if (cluster.isWorker) {
        meta.id = cluster.worker.id;
        meta.pid = cluster.worker.process.pid;
    }
    return { meta: meta };
};

// https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
const getStackTrace = () => {
    let obj = {};
    Error.captureStackTrace(obj, getStackTrace);
    return (obj.stack || '').split('\n');
};

const prefix = [];
const logger = new winston.Logger({
    exitOnError: false,
    level: settings.winston.level,
    transports: [
        new winston.transports.Console({
            colorize: true,
            timestamp: true,
            handleExceptions: true,
            json: false
        })
    ]
});

export default {
    logger,
    log: function(...args) {
        let level = args.shift();
        let stackTrace = getStackTrace()[2];
        logger.log(level, util.format.apply(util.format, prefix.concat(args).concat(stackTrace)), meta());
    },
    debug: function(...args) {
        let stackTrace = getStackTrace()[2];
        logger.debug(util.format.apply(util.format, prefix.concat(args).concat(stackTrace)), meta());
    },
    verbose: function(...args) {
        let stackTrace = getStackTrace()[2];
        logger.verbose(util.format.apply(util.format, prefix.concat(args).concat(stackTrace)), meta());
    },
    info: function(...args) {
        let stackTrace = getStackTrace()[2];
        logger.info(util.format.apply(util.format, prefix.concat(args).concat(stackTrace)), meta());
    },
    warn: function(...args) {
        let stackTrace = getStackTrace()[2];
        logger.warn(util.format.apply(util.format, prefix.concat(args).concat(stackTrace)), meta());
    },
    error: function(...args) {
        let stackTrace = getStackTrace()[2];
        logger.error(util.format.apply(util.format, prefix.concat(args).concat(stackTrace)), meta());
    }
};
