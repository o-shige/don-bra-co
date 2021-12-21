'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class word extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      word.belongsToMany(word, { as: 'synonyms', through: models.wordSynonym })
    }
  };
  word.init({
    content: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'word',
    underscored: true,
  });
  return word;
};