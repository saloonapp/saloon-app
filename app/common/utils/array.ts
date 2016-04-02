export class Sort {
    public static str(str1: string, str2: string): number {
        if(str1 > str2) return 1
        else if(str1 < str2) return -1
        else return 0
    }
    public static num(n1: number, n2: number): number {
        return n1 - n2;
    }
    public static multi(...args: number[]): number {
        for(let i in args){
            if(args[i] !== 0){
                return args[i];
            }
        }
        return 0;
    }
}