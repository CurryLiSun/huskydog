'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return Promise.all([
      queryInterface.addColumn(
        'bot_users',
        'groupNum',
        {
          type: Sequelize.INTEGER
        }
      ),
      queryInterface.addColumn(
        'bot_users',
        'userAuth',
        {
          type: Sequelize.INTEGER
        }
      ),
      queryInterface.addColumn(
        'bot_users',
        'enable',
        {
          type: Sequelize.BOOLEAN
        }
      ),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
