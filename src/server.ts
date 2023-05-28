import app from './index';
import { connectDB } from './db';

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});