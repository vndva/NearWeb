const libName = 'Bots.Business: NearWeb.js';
const libPrefix = '_nearwebjs';

function onHttpSuccess() {
    try { 
        const options = JSON.parse(content);
        Bot.runCommand(params, { ...options });
    } catch (e) {
        throw new Error(e);
    }
}

function onHttpError() {
    throw content;
}

class BaseAPI {
    constructor(httpProvider) {
        this.name = libName;
        this.prefix = libPrefix;
        this.httpProvider = httpProvider;
    }

    changeProvider(httpProvider) {
        this.httpProvider = httpProvider;
    }

    _base64Encode(message) {
        return Buffer.from(message, 'utf-8').toString('base64');
    }

    _base64Decode(message) {
        return Buffer.from(message, 'base64').toString('utf-8');
    }

    _buildParams(id, method, params = {}) {
        const options = {};
        options['jsonrpc'] = '2.0';
        options['method'] = method;
        options['params'] = { ...params };
        options['id'] = id;
        return JSON.stringify(options);
    }

    _sendPost(options) {
        options['body'] = this._buildParams(options.id, options.method, { ...options.body });
        HTTP.post({
            url: this.httpProvider,
            body: options.body,
            success: this.prefix + 'onHttpSuccess ' + options.onSuccess,
            error: this.prefix + 'onHttpError',
            ...options
        });
    }
}

class Mainnet extends BaseAPI {
    static httpProvider = 'https://rpc.mainnet.near.org';

    constructor() {
        super(Mainnet.httpProvider);
        this.contracts = new Contracts(this);
    }
}

class Testnet extends BaseAPI {
    static httpProvider = 'https://rpc.testnet.near.org';

    constructor() {
        super(Testnet.httpProvider);
        this.contracts = new Contracts(this);
    }
}

class Contracts {
    constructor(apiInstance) {
        this.apiInstance = apiInstance;
    }

    viewAccount(options = {}) {
        options.id = 'NEAR:contracts:view_account';
        options.method = 'query';
        options.body = { ...options.body };
        options.body['request_type'] = 'view_account';
        this.apiInstance._sendPost(options);
    }

    viewAccountChanges(options = {}) {
        options.id = 'NEAR:contracts:view_account_changes';
        options.method = 'EXPERIMENTAL_changes';
        options.body = { ...options.body };
        options.body['changes_type'] = 'account_changes';
        this.apiInstance._sendPost(options);
    }

    callFunction(options = {}) {
        options.id = 'NEAR:contracts:call_function';
        options.method = 'query';
        options.body = { ...options.body };
        options.body['request_type'] = 'call_function';
        this.apiInstance._sendPost(options);
    }
}

publish({
    Mainnet: Mainnet,
    Testnet: Testnet
});

on(libPrefix + 'onHttpSuccess', onHttpSuccess);
on(libPrefix + 'onHttpError', onHttpError);
