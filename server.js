import express from 'express';
import taskRoutes from './routes/taskRoutes.js';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import notFound from './middleware/notFoundHandler.js';
import db from './config/db.js';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 5000;

// Body parser middleware OR Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Test Route
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);


// Temporary test route
app.get('/test-db', (req, res) => {
    db.query('SELECT 1', (err, results) => {

        if (err) {
            return res.status(500).json(err);
        }
        res.json({ message: 'DB working', results });
    });
});

// 404 handler ( must come AFTER routes )
app.use(notFound);

// error handler ( must be last )
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on the port ${port}`);
});
