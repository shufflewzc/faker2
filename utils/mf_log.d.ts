declare class Log {
    constructor();
    m(s: string): any;
    sleep(ms: number): Promise<unknown>;
    main(): Promise<any>;
}
export { Log };
