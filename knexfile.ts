// knexfile.ts (NOVO - Para PostgreSQL)

import { Knex } from 'knex';

const config: Knex.Config = {
  client: 'pg', // Driver para PostgreSQL
  connection: {
    host: 'localhost',   
    user: 'user_app',            
    password: 'S1mpl3_Pass', 
    database: 'catalogomusicas', 
    port: 5432, // Porta do Postgres
  },
  migrations: {
    tableName: 'knex_migrations'
  }
};

export default config;