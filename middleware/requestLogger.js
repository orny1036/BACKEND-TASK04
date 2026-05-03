import logger from '../config/logger.js';

const requestLogger = (req, res, next) => {
    
    const start = Date.now();
    
    res.on('finish', () => {
        logger.info({
            method: req.method,
            route: req.originalUrl,
            status: res.statusCode,
            responseTime: `${Date.now() - start}ms`,
            user: req.user?.id || 'unauthenticated'
        });
    });

    next();
};
export default requestLogger;