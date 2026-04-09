import { app } from './app';
import { env } from 'process';

const PORT = env.PORT;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
