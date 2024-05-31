import config from 'dos-config';
import fs from 'fs';
import path from 'path';

import express from 'express';
import swaggerUi  from 'swagger-ui-express';
import yaml from 'yaml';
import { minimatch } from 'minimatch';

import createGithub from './services/github';

import handlePushToEditing from './push-to-editing';
import handlePushToProduction from './push-to-production';
import { BlogConfig, GithubCommit } from './types';

const app = express();
app.use(express.json())

// TODO: should type this
const swaggerDocument = yaml.parse(fs.readFileSync('swagger.yaml', 'utf-8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const handlePush = async (
  default_branch: string,
  head_commit: GithubCommit,
  installationId: number, 
  full_name: string,
  ref: string,
) => {
  const github = await createGithub(
    {
      id: config.github.appId,
      certBase64: config.github.certBase64,  
    },
    full_name,
    installationId
  );

  // Get config.json from blog's repo, not an env var since til blog repo already exists
  const cfgBlob = await github.getBlobText(default_branch, 'config.json');
  const blogConfig = JSON.parse(cfgBlob) as BlogConfig;

  // Look for added files to target folder
  const { added } = head_commit;
  const posts = (added as string[]).filter(path => minimatch(path, blogConfig.postsFormat));
  if (posts.length) {
    if (ref === `refs/heads/${blogConfig.editing}`) {
      await handlePushToEditing(github, blogConfig, posts);
    } 

    if (ref === `refs/heads/${blogConfig.production}`) {
      await handlePushToProduction(github, ref, posts);
    }
  } else {
    console.log(`No posts *added* for repo ${full_name}.`);
  }

  return `${JSON.stringify(head_commit)} ${installationId} ${ref} ${default_branch} ${full_name}`;
};

app.post('/api', async (req, res) => {
  const event = req.headers['x-github-event'];
  if (event === 'push') {
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