const express = require('express');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use('/api', chatRoutes);

app.get('/', (req, res) => {
  res.send('🧠 Chat History API is running!');
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
