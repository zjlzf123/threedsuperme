export declare class AvatarSDK {
    [key: string]: any;
    constructor(token: string, url: string);
    _url(url: string | URL): URL;
    _performRequest(url: any, fetchObj?: any): Promise<Response>;
    _jsonResponse(responsePromise: Promise<any>): Promise<unknown>;
    get_available_parameters(pipeline: string, subtype: string): Promise<unknown>;
    get_available_export_parameters(pipeline: string, subtype: string): Promise<unknown>;
    create_avatar(name: string, photo: any, pipeline: string, subtype: string, parameters: any, export_parameters: any): Promise<unknown>;
    get_avatar(avatar: {
        [x: string]: any;
    }): Promise<unknown>;
    _poll_impl(avatar: any, resolve: any, reject: any, onProgress: any, iIntervalGetter: any): void;
    poll_avatar(avatar: any, onProgress: any): Promise<unknown>;
    get_exports(avatar: any): Promise<unknown>;
    poll_export(avatarExport: any, onProgress: any): Promise<unknown>;
    download_export_file(url: any, filename: any, useBlob?: boolean): Promise<string> | Promise<URL>;
    _extractZipFiles(blob: any): Promise<any>;
    get_export_file_contents(avatarExportFile: any, onProgress: any): Promise<any>;
}
