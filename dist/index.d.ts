declare function threedsuperme(file: any, { returnDataType, onCompletedProgress, onExportProgress, callback }: {
    returnDataType: string;
    onCompletedProgress: (data: any) => void;
    onExportProgress: (data: any) => void;
    callback: (data: any) => void;
}): Promise<void>;
export default threedsuperme;
