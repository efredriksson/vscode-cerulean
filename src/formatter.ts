import { workspace, type Disposable, type OutputChannel } from "vscode";
import { Daemon, type FormatResult, type SpawnErrorHandler } from "./daemon";

export class Formatter implements Disposable {
    private daemon: Daemon;
    private readonly configListener: Disposable;

    constructor(
        private readonly output: OutputChannel,
        private readonly onSpawnError: SpawnErrorHandler
    ) {
        this.daemon = this.makeDaemon(readCliPath());
        this.configListener = workspace.onDidChangeConfiguration((event) => {
            if (!event.affectsConfiguration("cerulean.cliPath")) return;
            const next = readCliPath();
            if (next === this.daemon.cliPath) return;
            this.daemon.dispose();
            this.daemon = this.makeDaemon(next);
        });
    }

    format(source: string): Promise<FormatResult> {
        return this.daemon.format(source);
    }

    dispose(): void {
        this.configListener.dispose();
        this.daemon.dispose();
    }

    private makeDaemon(cliPath: string): Daemon {
        return new Daemon({
            cliPath,
            output: this.output,
            onSpawnError: this.onSpawnError,
        });
    }
}

function readCliPath(): string {
    return workspace
        .getConfiguration("cerulean")
        .get<string>("cliPath", "ceru");
}
