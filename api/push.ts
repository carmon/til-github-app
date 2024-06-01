import config from 'dos-config';
import { minimatch } from 'minimatch';

import createGithub from './services/github';
import handlePushToEditing from './push-to-editing';
import handlePushToProduction from './push-to-production';

import { BlogConfig, GithubCommit } from './types';

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

export default handlePush;
