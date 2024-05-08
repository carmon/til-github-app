til-github-app
==============

Github App that manages a til blog repository.

nodejs usuals: `npm i` `npm start` to run locally.
`/config` folder has the JSON config for the App.

Services for webhooks
=====================

The Github App listen to the webhooks of the target repository, every time a PUSH event happens it loads the `config.json` file on target repo,
checks that current pushed branch matches `editing` or `production` branches, check if any files were added to `postsFormat` folder type, 
and calls one of the services. 

- `push-to-editing.ts`: Takes the date of the commit and uses it as publish date of post, and adds it to `dates.json` file on the repository, 
then the app's bot pushes a commit with the updated dates, and makes a pull request out of it: we are ready to review the blog post and publish to production.

- `push-to-production.ts`: Takes the first line of the last markdown file added and uses it as a title, to publish a tweet to blog's X account in case of having one.