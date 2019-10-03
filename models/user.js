module.exports = function(sequelize, DataTypes) {
    return sequelize.define("Users", {
        userId: DataTypes.STRING
    },{
        tableName: 'BotUsers', // this will define the table's name
        timestamps: false           // this will deactivate the timestamp columns
    });
}