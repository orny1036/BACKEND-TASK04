import mysql from 'mysql2/promise';

const db = await mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'nto20021018',
    database: 'task_manager'
});

// db.connect((err) => {
//    if(err) {
//     console.error('Database connection failed:', err);
//     return;
//    }
//    console.log('MySQL Connected...');
// });

export default db;