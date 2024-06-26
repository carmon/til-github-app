// External blog config, resides in a blog repo at config.json file in root folder
export type BlogConfig = {
  datesFile: string;
  editing: string;
  postsFormat: string;
  production: string;
}

// Github
export type GithubAppConfig = {
  id: number;
  certBase64: string;
}

export type GithubService = {
  createBlob: (content: string) => Promise<string>;
  createCommit: (message: string, tree: string, parent?: string) => Promise<string>;
  createFile: (path: string, content: string, message: string) => Promise<string>;
  createPR: (head: string, base: string) => Promise<GithubPR>;
  createRef: (branch: string, sha: string) => Promise<string>;
  createTree: (path: string, blobSha: string, baseSha?: string) => Promise<string>;
  generateBlogRepo: (owner: string, name: string) => Promise<void>;
  getBlobText: (branch: string, path: string) => Promise<string>;
  getBranches: () => Promise<void>;
  getFileDate: (branch: string, path: string) => Promise<string>;
  getPR: (head: string, base: string) => Promise<GithubPR | null>;
  getRef: (branch: string) => Promise<string>;
  updateRef: (branch: string, sha: string) => Promise<void>;
};

export type GithubPR = {
  number: number;
  sha: string;
};

export type GithubCommit = {
  added: string[];
  removed: string[];
}
