import mysql from 'mysql2/promise';

const db = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// db.connect((err) => {
//    if(err) {
//     console.error('Database connection failed:', err);
//     return;
//    }
//    console.log('MySQL Connected...');
// });

export default db;