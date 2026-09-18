declare module 'laravel-vite-plugin' {
    import { Plugin } from 'vite';
    
    interface LaravelVitePluginOptions {
        input: string[];
        refresh?: boolean;
        publicDirectory?: string;
        buildDirectory?: string;
        hotFile?: string;
    }

    export default function laravelVitePlugin(options: LaravelVitePluginOptions): Plugin;
}
