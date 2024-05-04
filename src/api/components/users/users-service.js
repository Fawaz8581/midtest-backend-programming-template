const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of users
 * @returns {Array}
 */
/**
 * Get list of users with pagination, sort, and search
 * @param {number} page_number - Nomor halaman yang ditampilkan
 * @param {number} page_size - Jumlah data yang dimunculkan per halaman
 * @param {string} sort - Sort order (<field name>:<sort order>)
 * @param {string} search - Search criteria (<field name>:<search key>)
 * @returns {Object} Objek berisi data pengguna dan informasi paginasi
 */
async function getUsers(page_number, page_size, sort, search) {
  // Mendapatkan total jumlah pengguna
  const total_users = await usersRepository.getUsers(search);

  // Menghitung total halaman berdasarkan jumlah pengguna dan ukuran halaman
  const total_pages = Math.ceil(total_users / page_size);

  // Menghitung offset untuk query database
  const offset = (page_number - 1) * page_size;

  // Mendapatkan daftar pengguna untuk halaman tertentu
  const users = await usersRepository.getUsers(offset, page_size, sort, search);

  // Membuat data respons
  const response = {
    page_number: page_number,
    page_size: page_size,
    count: users.length,
    total_pages: total_pages,
    has_previous_page: page_number > 1,
    has_next_page: page_number < total_pages,
    data: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    })),
  };

  return response;
}

// Search and Sort dari Pagination filter //
// Search and Sort dari Pagination filter //
async function getUsers(page = 1, limit = null, searchQuery = '', sorting) {
  const userList = await usersRepository.getUsers();

  // Filter users based on search query
  const filteredList = userList.filter((user) => {
    const searchTerm = searchQuery.toLowerCase();
    if (searchTerm.includes(':')) {
      const [field, term] = searchTerm.split(':');
      if (field === 'email') {
        return user.email.toLowerCase().includes(term);
      } else if (field === 'name') {
        return user.name.toLowerCase().includes(term);
      } else {
        return false;
      }
    } else {
      return (
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }
  });

  // Sort users based on sorting query
  let sortedList;
  if (sorting) {
    const sortParts = sorting.split(':');
    if (sortParts.length === 2) {
      const field = sortParts[0];
      const direction = sortParts[1];
      sortedList = filteredList.slice().sort((a, b) => {
        if (field === 'name') {
          return direction === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else if (field === 'email') {
          return direction === 'asc'
            ? a.email.localeCompare(b.email)
            : b.email.localeCompare(a.email);
        } else {
          return 0;
        }
      });
    } else {
      sortedList = filteredList.slice(); // Default to no sorting
    }
  } else {
    sortedList = filteredList.slice(); // Default to no sorting
  }

  // Pagination logic
  const startIndex = (page - 1) * limit;
  const endIndex = limit
    ? Math.min(startIndex + limit, sortedList.length)
    : sortedList.length;
  const paginatedList = sortedList.slice(startIndex, endIndex);

  // Format the data
  const formattedResults = paginatedList.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
  }));

  // Pagination information
  const totalUsers = sortedList.length;
  const totalPages = Math.ceil(totalUsers / (limit || sortedList.length));
  const hasPreviousPage = page > 1;
  const hasNextPage = totalPages > page;

  return {
    page_number: page,
    page_size: limit,
    count: paginatedList.length,
    total_pages: totalPages,
    has_previous_page: hasPreviousPage,
    has_next_page: hasNextPage,
    data: formattedResults,
  };
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
};

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
};
