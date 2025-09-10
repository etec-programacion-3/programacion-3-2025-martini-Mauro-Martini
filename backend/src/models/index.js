import User from './User.js';
import Game from './Game.js';

User.hasMany(Game);
Game.belongsTo(User);

export { User, Game };