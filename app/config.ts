export class Config {
    private static dev = {
        envName: 'dev',
        debug: true,
        backendUrl: 'https://dev-saloon.herokuapp.com/api/v2'
    };
    private static prod = {
        envName: 'prod',
        debug: false,
        backendUrl: 'https://saloonapp.herokuapp.com/api/v2'
    };
    private static env = Config.dev;

    public static envName = Config.env.envName;
    public static debug = Config.env.debug;
    public static appVersion = '2.0.0';
    public static gitBranch = 'v2';
    public static gitCommit = '7c3989d';
    public static buildDate = '2016-05-09 21:46';
    public static emailSupport = 'contact@saloonapp.co';
    public static backendUrl = Config.env.backendUrl;
}
