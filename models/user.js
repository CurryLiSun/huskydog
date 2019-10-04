module.exports = function(sequelize, DataTypes) {
    return sequelize.define("BotUsers", {
        userId: DataTypes.STRING
    },{
        tableName: 'bot_users', // this will define the table's name
        timestamps: false           // this will deactivate the timestamp columns
    });
}