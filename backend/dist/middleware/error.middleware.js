"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';
    // Handle specific error types
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
    }
    if (error.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }
    if (error.name === 'MongoServerError' && error.message.includes('duplicate key')) {
        statusCode = 409;
        message = 'Resource already exists';
    }
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error Stack:', error.stack);
    }
    res.status(statusCode).json({
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};
exports.errorHandler = errorHandler;
const createError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
//# sourceMappingURL=error.middleware.js.map