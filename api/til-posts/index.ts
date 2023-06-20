// import config from 'dos-config';
// import { createAppAuth } from '@octokit/auth-app';
// import { Octokit } from '@octokit/rest';
// import { NowRequest, NowResponse } from '@vercel/node';

// type FileData = {
//     content: string;
//     name: string;
//     type: 'file';
// }

// const isFileData = (data: { type: string }): boolean => data.type === 'file';
// const decodeBase64 = (s: string) => Buffer.from(s, 'base64').toString();

// type Endpoint = (req:NowRequest, res: NowResponse) => void;

// const allowCors = (fn: Endpoint) => async (req:NowRequest, res: NowResponse) => {
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     // another common pattern
//     // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
//     // res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
//     res.setHeader('Access-Control-Allow-Methods', 'GET');
//     res.setHeader(
//         'Access-Control-Allow-Headers',
//         'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
//     );
//     if (req.method === 'OPTIONS') {
//         res.status(200).end();
//         return;
//     }
//     return await fn(req, res);
// }

// const getPosts = (_: NowRequest, response: NowResponse) => {
//     const { appId, installationId, certBase64 } = config.github;
//     const privateKey = decodeBase64(certBase64) || '';
//     const octokit = new Octokit({
//         auth: {
//             appId,
//             installationId,
//             privateKey,
//         },
//         authStrategy: createAppAuth,
//     });

//     const getTilContents = async (path: string) => {
//         const { owner, ref, repo } = config.github;
//         return await octokit.repos.getContent({
//             owner,
//             path,
//             ref,
//             repo,
//         });
//     }

//     getTilContents('posts').then(async res => {
//         const { data } = res;
//         if (Array.isArray(data)) {
//             const files = await Promise.all(
//                 data.map(async ({ path }) => {
//                     const { data } = await getTilContents(path);
//                     if (Array.isArray(data) || !isFileData(data)) return {};
//                     const { content, name } = data as FileData;
//                     return { name, text: decodeBase64(content) };
//                 }),
//             );
//             console.log(files);
//             response.status(200).send(files);
//         }
//     }).catch(err => {
//         console.log(err);
//         response.status(200).send(err);
//     });
// }

// export default allowCors(getPosts);