class AppError extends Error {
    /**
     * @param {string} message Error message
     * @param {number} statusCode HTTP status code (Default: 500)
     */
    constructor(message, statusCode = 500) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
