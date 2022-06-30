interface User {
    index: number;
    UserName: string;
    cookie: string;
    UserAgent: string;
    end?: boolean;
}
declare class JDHelloWorld {
    scriptName: string;
    cookiesArr: string[];
    users: User[];
    constructor(scriptName?: string);
    getCookie(): Promise<void>;
    exceptCookie(filename?: string): string[];
    get(url: string, headers?: any): Promise<unknown>;
    post(url: string, data: any, headers?: any, params?: object): Promise<object | string>;
    wait(ms?: number): Promise<unknown>;
    o2s(obj: object, title?: string): void;
    getShareCodePool(key: string, num: number): Promise<string[]>;
    getshareCodeHW(key: string): Promise<string[]>;
    getRandomNumberByRange(start: number, end: number): number;
    getRandomNumString(e: number): string;
    getEncStr(fn: string, body: {
        id?: number;
        taskType?: number;
    }): object;
    getSign(fn: string, body: object): Promise<string>;
    cashDoSign(): Promise<unknown>;
    run(son: {
        main: any;
        help?: any;
        tips?: any;
    }, help?: Function, tips?: Function): Promise<void>;
}
export { User, JDHelloWorld };
