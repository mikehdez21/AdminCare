declare module 'laravel-vite-plugin' {
    import { Plugin } from 'vite';
    
    interface LaravelVitePluginOptions {
        input: string[];
        refresh?: boolean;
    }

    export default function laravelVitePlugin(options: LaravelVitePluginOptions): Plugin;
}
