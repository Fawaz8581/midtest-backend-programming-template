const { create } = require('lodash');
const { transferId } = require('../../../models/transfers-schema');
const { transfer } = require('../../../models');
const { User } = require('../../../models');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * get a list of transfer
 * @returns {Promise}
 */
async function getTransfer() {
  return transfer.find({});
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getTransfer1(id) {
  return transfer.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

async function createTransfer(
  transferId,
  fromUserId,
  toUserId,
  amount,
  timestamp
) {
  return transfer.create({
    transferId,
    fromUserId,
    toUserId,
    amount,
    timestamp,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Update existing transfer
 * @param {string} id - User ID
 * @param {string} amount - amount
 * @returns {Promise}
 */
async function updateTransfer(id, amount) {
  return transfer.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        amount,
      },
    }
  );
}
/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Delete a transfer
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteTransfer(id) {
  return transfer.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  deleteTransfer,
  getTransfer1,
  updateTransfer,
  getTransfer,
  createTransfer,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
};
