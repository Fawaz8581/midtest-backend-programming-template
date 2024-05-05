const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

// Object to store failed login attempts and their timestamps
const failedLoginAttempts = {};

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    // Check if email has exceeded login attempts limit
    if (failedLoginAttempts[email] && failedLoginAttempts[email].count >= 5) {
      const currentTime = Date.now();
      // Check if 30 minutes have passed since the last failed attempt
      if (currentTime - failedLoginAttempts[email].timestamp < 30 * 60 * 1000) {
        throw errorResponder(
          errorTypes.FORBIDDEN,
          'Too many failed login attempts. Please try again in 30 minutes.'
        );
      } else {
        // Reset failed attempts counter and timestamp
        failedLoginAttempts[email] = { count: 0, timestamp: currentTime };
      }
    }

    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (!loginSuccess) {
      // Increment failed login attempts counter
      failedLoginAttempts[email] = {
        count:
          (failedLoginAttempts[email] ? failedLoginAttempts[email].count : 0) +
          1,
        timestamp: Date.now(),
      };
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Wrong email or password'
      );
    }

    // Clear failed login attempts if login is successful
    if (failedLoginAttempts[email]) {
      delete failedLoginAttempts[email];
    }

    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
