export class Config {
    private static dev = {
        backendUrl: 'https://dev-saloon.herokuapp.com/api/v2'
    };
    private static prod = {
        backendUrl: 'https://saloonapp.herokuapp.com/api/v2'
    };
    private static env = Config.dev;

    public static appVersion = '2.0.0~';
    public static emailSupport = 'contact@saloonapp.co';
    public static backendUrl = Config.env.backendUrl;
}
