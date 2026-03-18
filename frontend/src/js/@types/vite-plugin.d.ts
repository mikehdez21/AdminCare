declare module 'laravel-vite-plugin' {
    import { Plugin } from 'vite';
    
    interface LaravelVitePluginOptions {
        input: string | string[];
        refresh?: boolean;
        publicDirectory?: string;
        buildDirectory?: string;
        [key: string]: unknown;
    }

    export default function laravelVitePlugin(options: LaravelVitePluginOptions): Plugin;
}
