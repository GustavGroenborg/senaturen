/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_MAPBOX_TOKEN: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare module 'togpx' {
    function togpx(geojson: any, options?: any): string;
    export default togpx;
}
