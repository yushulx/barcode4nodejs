export enum formats {
    ALL = 0xFFFFFFFEFFFFFFFF,
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
    CODE_32 = 0x1000000,
    PDF417 = 0x02000000,
    QR_CODE = 0x04000000,
    DATAMATRIX = 0x08000000,
    AZTEC = 0x10000000,
    MAXICODE = 0x20000000,
    MICRO_QR = 0x40000000,
    MICRO_PDF417 = 0x00080000,
    GS1_COMPOSITE = 0x80000000,
    MSI_CODE = 0x100000,
    CODE_11 = 0x200000,
    TWO_DIGIT_ADD_ON = 0x400000,
    TWO_FIVE_DIGIT_ADD_ON = 0x800000,
    MATRIX_25 = 0x1000000000,
    POSTALCODE = 0x3F0000000000000,
    NONSTANDARD_BARCODE = 0x100000000,
    USPSINTELLIGENTMAIL = 0x10000000000000,
    POSTNET = 0x20000000000000,
    PLANET = 0x40000000000000,
    AUSTRALIANPOST = 0x80000000000000,
    RM4SCC = 0x100000000000000,
    KIX = 0x200000000000000,
    DOTCODE = 0x200000000,
    PHARMACODE_ONE_TRACK = 0x400000000,
    PHARMACODE_TWO_TRACK = 0x800000000,
    PHARMACODE = 0xC00000000
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
}

export function getVersion(): string;
export function initLicense(license: string): void;
export function setLicenseCachePath(path: string): void;
export function destroyInstance(): void;
export function createInstance(): BarcodeReader;

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
