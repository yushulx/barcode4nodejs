export enum formats {
    ALL = 0xFE3FFFFF,
    ONED = 0x003007FF,
    GS1_DATABAR = 0x0003F800,
    CODE_39 = 0x1,
    CODE_128 = 0x2,
    CODE_93 = 0x4,
    CODABAR = 0x8,
    ITF = 0x10,
    EAN_13 = 0x20,
    EAN_8 = 0x40,
    UPC_A = 0x80,
    UPC_E = 0x100,
    INDUSTRIAL_25 = 0x200,
    CODE_39_EXTENDED = 0x400,
    GS1_DATABAR_OMNIDIRECTIONAL = 0x800,
    GS1_DATABAR_TRUNCATED = 0x1000,
    GS1_DATABAR_STACKED = 0x2000,
    GS1_DATABAR_STACKED_OMNIDIRECTIONAL = 0x4000,
    GS1_DATABAR_EXPANDED = 0x8000,
    GS1_DATABAR_EXPANDED_STACKED = 0x10000,
    GS1_DATABAR_LIMITED = 0x20000,
    PATCHCODE = 0x00040000,
    PDF417 = 0x02000000,
    QR_CODE = 0x04000000,
    DATAMATRIX = 0x08000000,
    AZTEC = 0x10000000,
    MAXICODE = 0x20000000,
    MICRO_QR = 0x40000000,
    MICRO_PDF417 = 0x00080000,
    GS1_COMPOSITE = 0x80000000,
    MSI_CODE = 0x100000,
    CODE_11 = 0x200000
}

export enum readerTypes {
    DEFAULT = "",
    CONCURRENT = "concurrent",
}

export type BarcodeResult = {
    format: string
    value: string
    x1: number
    y1: number
    x2: number
    y2: number
    x3: number
    y3: number
    x4: number
    y4: number
    page: number
    time: number
    angle: number
    isMirrored: number
}

export interface BarcodeReader {
    decodeFileAsync(filePath: string, format: formats, callback?: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void;
    decodeFileAsync(filePath: string, format: formats, template?: string): Promise<BarcodeResult[]>;
    decodeFileStreamAsync(stream: any, length: number, format: formats, callback?: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void;
    decodeFileStreamAsync(stream: any, length: number, format: formats, template?: string): Promise<BarcodeResult[]>;
    decodeBase64Async(base64String: string, format: formats, callback: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void;
    decodeBase64Async(base64String: string, format: formats, template?: string): Promise<BarcodeResult[]>;
    decodeYUYVAsync(data: any, width: number, height: number, format: formats, callback?: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void;
    decodeYUYVAsync(data: any, width: number, height: number, format: formats, template?: string): Promise<BarcodeResult[]>;
    decodeBufferAsync(buffer: any, width: number, height: number, stride: number, format: formats, callback?: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void;
    decodeBufferAsync(buffer: any, width: number, height: number, stride: number, format: formats, template?: string): Promise<BarcodeResult[]>;
    destroyInstance(): void;

    decodeFile(filePath: string, format: formats, callback?: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void;
    decodeFile(filePath: string, format: formats, template?: string): BarcodeResult[];
    decodeFileStream(stream: any, length: number, format: formats, callback?: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void;
    decodeFileStream(stream: any, length: number, format: formats, template?: string): BarcodeResult[];
    decodeBase64(base64String: string, format: formats, callback: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void;
    decodeBase64(base64String: string, format: formats, template?: string): BarcodeResult[];
    decodeYUYV(data: any, width: number, height: number, format: formats, callback?: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void;
    decodeYUYV(data: any, width: number, height: number, format: formats, template?: string): BarcodeResult[];
    decodeBuffer(buffer: any, width: number, height: number, stride: number, format: formats, callback?: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void;
    decodeBuffer(buffer: any, width: number, height: number, stride: number, format: formats, template?: string): BarcodeResult[];
}

export function getVersion(): string;
export function initLicense(license: string): void;
export function setLicenseCachePath(path: string): void;
export function destroyInstance(): void;
export function createInstance(readerType: readerTypes): BarcodeReader;

// Asynchronous API
export function decodeFileAsync(filePath: string, format: formats, callback?: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void;
export function decodeFileAsync(filePath: string, format: formats, template?: string): Promise<BarcodeResult[]>;
export function decodeFileStreamAsync(stream: any, length: number, format: formats, callback?: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void;
export function decodeFileStreamAsync(stream: any, length: number, format: formats, template?: string): Promise<BarcodeResult[]>;
export function decodeBase64Async(base64String: string, format: formats, callback: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void;
export function decodeBase64Async(base64String: string, format: formats, template?: string): Promise<BarcodeResult[]>;
export function decodeYUYVAsync(data: any, width: number, height: number, format: formats, callback?: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void;
export function decodeYUYVAsync(data: any, width: number, height: number, format: formats, template?: string): Promise<BarcodeResult[]>;
export function decodeBufferAsync(buffer: any, width: number, height: number, stride: number, format: formats, callback?: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void;
export function decodeBufferAsync(buffer: any, width: number, height: number, stride: number, format: formats, template?: string): Promise<BarcodeResult[]>;

// Synchronous API
export function decodeFile(filePath: string, format: formats, template?: string): BarcodeResult[];
export function decodeFileStream(stream: any, length: number, format: formats, template?: string): BarcodeResult[];
export function decodeBase64(base64String: string, format: formats, template?: string): BarcodeResult[];
export function decodeYUYV(data: any, width: number, height: number, format: formats, template?: string): BarcodeResult[];
export function decodeBuffer(buffer: any, width: number, height: number, stride: number, format: formats, template?: string): BarcodeResult[];