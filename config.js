const env = process.env;

const config = {
  db: { /* don't expose password or any sensitive info, done only for demo */
  host: env.DB_HOST || 'localhost',
  user: env.DB_USER || 'root',
  password: env.DB_PASSWORD || '@Jesus2302',
  database: env.DB_NAME || 'bd_prod',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
},
  TOKEN_SECRET: env.TOKEN_SECRET || "sec-12345",
  listPerPage: env.LIST_PER_PAGE || 1000,
};

module.exports = config;