import { GithubService } from "./types";

const getTwitterStatus = (title: string) => `New blog post: ${title} in https://til.vercel.app/`;

export default async (
  github: GithubService,
  ref: string,
  posts: string[],
) => {
  const titles = await Promise.all(
    posts.map(async (p: string) => (await github.getBlobText(ref, p)).split('\n')[0])
  ); // Get first lines of all posts
  
  console.log(titles);
  return titles.map(t => getTwitterStatus(t)); // Make a tweet for every title
};