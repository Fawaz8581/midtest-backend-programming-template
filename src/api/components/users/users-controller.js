const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get list of users request with pagination
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    const pageNum = parseInt(request.query.page_number) || 1;
    const pageSize = parseInt(request.query.page_size) || null;
    const searchQuery = request.query.search;
    const sorting = request.query.sort;

    // Menggunakan fungsi getUsers yang telah diperbarui di users-service
    const {
      page_number,
      page_size,
      count,
      total_pages,
      has_previous_page,
      has_next_page,
      data,
    } = await usersService.getUsers(pageNum, pageSize, searchQuery, sorting);

    return response.status(200).json({
      page_number,
      page_size,
      count,
      total_pages,
      has_previous_page,
      has_next_page,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

// Fungsi untuk mem-parsing parameter sort
function parseSort(sortParam) {
  if (!sortParam || typeof sortParam !== 'string') {
    return null;
  }

  const parts = sortParam.split(':');
  if (
    parts.length !== 2 ||
    !['name', 'email'].includes(parts[0]) ||
    !['asc', 'desc'].includes(parts[1])
  ) {
    return null;
  }

  return { field: parts[0], order: parts[1] };
}

// Fungsi untuk mem-parsing parameter search
function parseSearch(searchParam) {
  if (!searchParam || typeof searchParam !== 'string') {
    return null;
  }

  const parts = searchParam.split(':');
  if (parts.length !== 2 || !['name', 'email'].includes(parts[0])) {
    return null;
  }

  return { field: parts[0], key: parts[1] };
}

// Function lainnya tetap sama

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change user password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePassword(request, response, next) {
  try {
    // Check password confirmation
    if (request.body.password_new !== request.body.password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Check old password
    if (
      !(await usersService.checkPassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await usersService.changePassword(
      request.params.id,
      request.body.password_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change password'
      );
    }

    return response.status(200).json({ id: request.params.id });
  } catch (error) {
    return next(error);
  }
}
/**
 * Handle update transfer request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateTransfer(request, response, next) {
  try {
    const id = request.params.id;
    const amount = request.body.amount;

    const success = await usersService.updateTransfer(id, amount);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update transfer'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 
Handle get list of users request
@param {object} request - Express request object
@param {object} response - Express response object
@param {object} next - Express route middlewares
@returns {object} Response object or pass an error to the next route
*/
async function getTransfer(request, response, next) {
  try {
    const transfer = await usersService.getTransfers();
    return response.status(200).json(transfer);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteTransfer(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteTransfer(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}
/**
Handle create user request
@param {object} request - Express request object
@param {object} response - Express response object
@param {object} next - Express route middlewares
@returns {object} Response object or pass an error to the next route
*/
async function createTransfer(request, response, next) {
  try {
    const toUserId = request.body.toUserId;
    const amount = request.body.amount;
    const id = request.params.id;

    const success = await usersService.createTransfer(id, toUserId, amount);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create transfer'
      );
    }

    return response.status(200).json({ id, toUserId, amount });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  deleteTransfer,
  updateTransfer,
  getTransfer,
  createTransfer,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};
