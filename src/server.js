require('dotenv').config();

const app = require('./app');
const { PORT } = require('./config');

const PORT = process.env.PORT || 8000; 

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));