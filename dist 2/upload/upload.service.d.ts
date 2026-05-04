export declare const MAX_CV_BYTES: number;
export declare class UploadService {
    private readonly logger;
    private readonly client;
    private readonly bucket;
    constructor();
    isAllowed(file: Express.Multer.File): boolean;
    saveCv(file: Express.Multer.File): Promise<string>;
    getSignedUrl(objectKey: string, expiresInSec?: number): Promise<string>;
}
