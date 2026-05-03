import logger from '../config/logger.js';
import router from '../routes/taskRoutes.js';


const errorHandler = (err, req, res, next) => {
    
    logger.error({
        message: err.message,
        status: err.status || 500,
        route: req.originalUrl,
        method: req.method,
        stack: err.stack
    });
    
    const statusCode = err.status || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Server Error'
    });
};

export default errorHandler;