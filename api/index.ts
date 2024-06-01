import fs from 'fs';
import path from 'path';
import express from 'express';
import swaggerUi  from 'swagger-ui-express';
import yaml from 'yaml';

import handlePush from './push';

const app = express();
app.use(express.json())

// TODO: should type this
const swaggerDocument = yaml.parse(fs.readFileSync('swagger.yaml', 'utf-8'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post('/api', async (req, res) => {
  const event = req.headers['x-github-event'];
  if (event === 'push') {
    // TODO: Type the body and extract
    const {
      head_commit,
      installation: { id: installationId }, 
      ref, 
      repository: { default_branch, full_name } 
    } = req.body;
    res.end(await handlePush(default_branch, head_commit, installationId, full_name, ref));
    return;
  }
  if (event === 'installation_repositories') {
    const {
      installation: { id: installationId },
      repository_selection,
      repositories_added: [{ full_name }]
    } = req.body;
    res.end(`Application added to repository ${full_name} with installation ID ${installationId}, selection state is ${repository_selection}`);
    return;
  }
  res.end(`[RES] Event not found::: "${event}"`);
});

app.get('/index.html', (_req, res) => {
  res.sendFile(path.resolve('index.html'));
});

const port = 8000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

// module.exports = app;