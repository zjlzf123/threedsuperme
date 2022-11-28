export declare function _splitPipeline(value: string): string[];
export declare function _delete_parameters_duplicates(parameters: any, exportParameters: any): any;
export declare function _jsonResponse(responsePromise: Promise<any>): Promise<unknown>;
export declare function _cmp(a: number, b: number): 1 | 0 | -1;
export declare function _getAvatarExport(exports: any, asdk: any, idx?: number): any;
export declare function _now(): number;
export declare function _copy(obj: any): any;
export declare function _convertGuiColor(v: {
    [x: string]: any;
}): {
    red: any;
    green: any;
    blue: any;
};
export declare function generateExportParameters(parameters: any): any;
export declare function _getDefault(obj: {
    [x: string]: any;
    format?: string;
    embed?: boolean;
    embed_textures?: boolean;
}, key: string, dflt: {}): any;
export declare function generateVisualExportParameters(parameters: any): {
    format: string;
    embed: boolean;
    embed_textures: boolean;
};
export declare function visualizeExport(avatarExport: {
    [x: string]: any;
}, asdk: any): void;
