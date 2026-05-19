import { spawn, type ChildProcessWithoutNullStreams } from "child_process";
import type { OutputChannel } from "vscode";
import {
    FrameParser,
    encodeFormatRequest,
    encodeQuitRequest,
} from "./protocol";

export type FormatResult =
    | { ok: true; text: string }
    | { ok: false; error: string };

export type SpawnErrorHandler = (message: string) => void;

export interface DaemonOptions {
    cliPath: string;
    output: OutputChannel;
    onSpawnError: SpawnErrorHandler;
}

type PendingResolver = (result: FormatResult) => void;

export class Daemon {
    readonly cliPath: string;
    private readonly output: OutputChannel;
    private readonly onSpawnError: SpawnErrorHandler;
    private readonly parser: FrameParser;
    private childProcess: ChildProcessWithoutNullStreams | undefined;
    private pendingResolvers: PendingResolver[] = [];

    constructor(options: DaemonOptions) {
        this.cliPath = options.cliPath;
        this.output = options.output;
        this.onSpawnError = options.onSpawnError;
        this.parser = new FrameParser(options.output);
    }

    format(source: string): Promise<FormatResult> {
        return new Promise((resolve) => {
            const childProcess = this.ensureSpawned();
            if (!childProcess) {
                resolve({ ok: false, error: "daemon unavailable" });
                return;
            }
            this.pendingResolvers.push(resolve);
            // Single write to avoid interleaving with other concurrent format() callers.
            childProcess.stdin.write(encodeFormatRequest(source), "utf8");
        });
    }

    dispose(): void {
        if (this.childProcess && this.childProcess.exitCode === null) {
            try {
                this.childProcess.stdin.write(encodeQuitRequest());
                this.childProcess.stdin.end();
            } catch {
                /* ignore */
            }
            this.childProcess.kill();
        }
        this.childProcess = undefined;
    }

    private ensureSpawned(): ChildProcessWithoutNullStreams | undefined {
        if (this.childProcess && this.childProcess.exitCode === null) {
            return this.childProcess;
        }

        this.output.appendLine(`spawn: ${this.cliPath} daemon`);
        const childProcess = spawn(this.cliPath, ["daemon"], {
            stdio: ["pipe", "pipe", "pipe"],
        });

        childProcess.on("error", (err: Error & { code?: string }) => {
            this.output.appendLine(`daemon spawn error: ${err.message}`);
            if (err.code === "ENOENT") {
                this.onSpawnError(
                    `\`${this.cliPath}\` not found on PATH. Install via \`luarocks install cerulean\` or set \`cerulean.cliPath\`.`
                );
            }
            this.failPending("daemon failed to spawn");
        });
        childProcess.stdout.on("data", (chunk: Buffer) => this.onData(chunk));
        childProcess.stderr.on("data", (chunk: Buffer) =>
            this.output.append(chunk.toString("utf8"))
        );
        childProcess.on("exit", (code, signal) => {
            this.output.appendLine(
                `daemon exited: code=${code} signal=${signal}`
            );
            this.childProcess = undefined;
            this.parser.reset();
            this.failPending("daemon exited");
        });

        this.childProcess = childProcess;
        return childProcess;
    }

    private failPending(reason: string): void {
        const resolvers = this.pendingResolvers;
        this.pendingResolvers = [];
        for (const resolve of resolvers) {
            resolve({ ok: false, error: reason });
        }
    }

    private onData(chunk: Buffer): void {
        this.parser.push(chunk);
        for (let frame = this.parser.next(); frame; frame = this.parser.next()) {
            this.pendingResolvers.shift()?.(frame);
        }
    }
}
