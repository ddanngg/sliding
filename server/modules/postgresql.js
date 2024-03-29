const { Pool } = require('pg');
const {
	pgSSL,
	pgHost,
	pgPort,
	pgDatabase,
	pgUser,
	pgPassword,
	pgMaxPool,
} = requireWrp('config');

const pool = new Pool({
	ssl: pgSSL,
	user: pgUser,
	host: pgHost,
	database: pgDatabase,
	password: pgPassword,
	port: pgPort,
	max: pgMaxPool,
});

pool.query('SELECT NOW()', (err, res) => {
	console.warn(err || res.rows[0].now);
});

module.exports = pool;
