import { createApp } from './server.ts';

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});