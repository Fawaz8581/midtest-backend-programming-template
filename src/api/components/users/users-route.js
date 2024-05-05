const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const usersControllers = require('./users-controller');
const usersValidator = require('./users-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/users', route);

  // Get list of users
  route.get('/', authenticationMiddleware, usersControllers.getUsers);

  // Create user
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(usersValidator.createUser),
    usersControllers.createUser
  );

  // Get user detail
  route.get('/:id', authenticationMiddleware, usersControllers.getUser);

  // Update user
  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(usersValidator.updateUser),
    usersControllers.updateUser
  );

  // Delete user
  route.delete('/:id', authenticationMiddleware, usersControllers.deleteUser);

  // Change password
  route.post(
    '/:id/change-password',
    authenticationMiddleware,
    celebrate(usersValidator.changePassword),
    usersControllers.changePassword
  );
  // Delete transfer
  route.delete(
    '/transfer/:id',
    authenticationMiddleware,
    usersControllers.deleteTransfer
  );
  // Get list of users
  route.get('/', authenticationMiddleware, usersControllers.getUsers);

  // get list of transfer
  route.get(
    '/transfer',
    authenticationMiddleware,
    usersControllers.getTransfer
  );
  // create transfer
  route.post(
    '/transfer/:id',
    authenticationMiddleware,
    celebrate(usersValidator.createTransfer),
    usersControllers.createTransfer
  );
  // Update transfer
  route.put(
    '/transfer/:id',
    authenticationMiddleware,
    celebrate(usersValidator.updateTransfer),
    usersControllers.updateTransfer
  );
};
