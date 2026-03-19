const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/podcasts', require('./routes/podcastRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Microsoft Club GIKI API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

