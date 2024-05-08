import config from 'dos-config';
import express from 'express';
import path from 'path';
import { minimatch } from 'minimatch';

import createGithub from './services/github';

import handlePushToEditing from './push-to-editing';
import handlePushToProduction from './push-to-production';
import { BlogConfig } from './types';

const app = express();

app.use(express.json())

app.post('/api', async (req, res) => {
  const event = req.headers['x-github-event'];
  if (event === 'push') {
    const {
      head_commit,
      installation: { id: installationId }, 
      ref, 
      repository: { default_branch, full_name } 
    } = req.body;

    const github = await createGithub(
      {
        id: config.github.appId,
        certBase64: config.github.certBase64,  
      },
      full_name,
      installationId
    );

    // Get config.json from blog's repo
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
      console.log(`No posts found for repo ${full_name}.`);
    }
    
    res.end(`${JSON.stringify(head_commit)} ${installationId} ${ref} ${default_branch} ${full_name}`);

    return;
  }
  res.end(`Hello! Go the event is: "${event}"`);
});

app.get('/index.html', (_req, res) => {
  res.sendFile(path.resolve('index.html'));
});

const port = 8000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

// module.exports = app;