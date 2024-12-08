
const Keyv = require('keyv');
const db = new Keyv('sqlite://WorldCraftP.db');

module.exports = { db }
