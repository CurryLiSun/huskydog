module.exports = function(sequelize, DataTypes) {
    return sequelize.define("keyword_mapping", {
        userid: DataTypes.STRING,
        groupid: DataTypes.STRING,
        keyword: DataTypes.STRING,
        message: DataTypes.STRING
    },{
        tableName: 'keyword_mapping', // this will define the table's name
        timestamps: false           // this will deactivate the timestamp columns
    });
}