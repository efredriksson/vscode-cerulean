// Wire protocol for the `ceru daemon` stdio channel.
//
// Frame layout (both directions):
//     <KIND>\n<LENGTH>\n<BODY of LENGTH bytes>
//
// LENGTH is the byte count of BODY in decimal ASCII. BODY is not
// newline-terminated. Multiple frames may arrive in a single chunk and
// a single frame may straddle chunk boundaries.

const NEWLINE_BYTE = 0x0a;

const RequestKind = {
    Format: "FORMAT",
    Quit: "QUIT",
} as const;

const ResponseKind = {
    Ok: "OK",
    Err: "ERR",
} as const;

export type ParsedFrame =
    | { ok: true; text: string }
    | { ok: false; error: string };

export function encodeFormatRequest(source: string): string {
    const sourceByteLength = Buffer.byteLength(source, "utf8");
    return `${RequestKind.Format}\n${sourceByteLength}\n${source}`;
}

export function encodeQuitRequest(): string {
    return `${RequestKind.Quit}\n`;
}

export interface FrameLog {
    appendLine(message: string): void;
}

export class FrameParser {
    private buffer: Buffer = Buffer.alloc(0);

    constructor(private readonly log: FrameLog) {}

    push(chunk: Buffer): void {
        this.buffer = Buffer.concat([this.buffer, chunk]);
    }

    reset(): void {
        this.buffer = Buffer.alloc(0);
    }

    next(): ParsedFrame | null {
        const kindLineEnd = this.buffer.indexOf(NEWLINE_BYTE);
        if (kindLineEnd < 0) return null;

        const lengthLineEnd = this.buffer.indexOf(NEWLINE_BYTE, kindLineEnd + 1);
        if (lengthLineEnd < 0) return null;

        const rawKind = this.buffer.subarray(0, kindLineEnd).toString("utf8");
        const bodyLength = parseInt(
            this.buffer.subarray(kindLineEnd + 1, lengthLineEnd).toString("utf8"),
            10
        );
        if (Number.isNaN(bodyLength) || bodyLength < 0) {
            this.log.appendLine("bad frame length, resetting buffer");
            this.buffer = Buffer.alloc(0);
            return null;
        }

        const bodyStart = lengthLineEnd + 1;
        const bodyEnd = bodyStart + bodyLength;
        if (this.buffer.length < bodyEnd) return null;

        const body = this.buffer.subarray(bodyStart, bodyEnd).toString("utf8");
        this.buffer = this.buffer.subarray(bodyEnd);

        return classify(rawKind, body);
    }
}

function classify(rawKind: string, body: string): ParsedFrame {
    switch (rawKind) {
        case ResponseKind.Ok:
            return { ok: true, text: body };
        case ResponseKind.Err:
            return { ok: false, error: body };
        default:
            return { ok: false, error: `unexpected response kind '${rawKind}'` };
    }
}
