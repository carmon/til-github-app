declare module 'dos-config' {
    interface Config {
        github: {
            appId: number;
            certBase64: string;
            installationId: number;
            owner: string;
            ref: string;
            repo: string;
        }
    }
    const config: Config;
    export default config;
}

declare module 'minimatch' {
    export function minimatch(a: string, b:string): boolean;
}

