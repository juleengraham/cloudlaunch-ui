// Utility class for parsing cloud credentials from a file
import { Credentials, AWSCredentials, OpenStackCredentials, AzureCredentials, GCPCredentials } from '../../../shared/models/profile';

// Callback function for CredentialParser results
export declare type CredentialParserCallback = (creds: Credentials) => void;

// internal callback function to listen to file reader
declare type FileParserCallback = (content: string, callback: CredentialParserCallback) => void;

export class CredentialParser {

    public parser_type: string = null;

    static extractValueByKey(key: string, content: string): string {
        /* Regex description:
        Match the key, value part of a string like
        export OS_TENANT_NAME="<value>" or
        AWS_ACCESS_KEY: "<value>"

        With the result being <value>, without quotes.

        Begins by matching full text of keyname, followed by optional = or : symbols,
        followed by an optional whitespace, followed by an optional capture group (1)
        for the double quote, followed by any text other than double-quotes. $ symbols
        and new lines, followed by capture group (1) again if it existed (this makes
        sure that either both beginning and ending double-quotes are present, or
        none are). The value corresponding to the key will end up in match group 2.
        */
        const regex = new RegExp(key + '[=:]\\s?(")?([^"\\n\\$]+)\\1?');
        const match = regex.exec(content);
        if (match) {
            return match[2];
        } else {
            return null;
        }
    }

    constructor(parser_type: string) {
        this.parser_type = parser_type;
    }

    public loadCredentialsFromFile(file: any, callback: CredentialParserCallback) {
        let parserFunc: FileParserCallback;

        switch (this.parser_type) {
            case 'AWSCredentials': {
                parserFunc = this.parseAWSCreds;
                break;
            }
            case 'AzureCredentials': {
                parserFunc = this.parseAzureCreds;
                break;
            }
            case 'OpenStackCredentials': {
                parserFunc = this.parseOpenstackCreds;
                break;
            }
            case 'GCPCredentials': {
                parserFunc = this.parseGCPCreds;
                break;
            }
            default: {
                throw new Error(`Unrecognised parser type: ${this.parser_type}`);
            }
        }
        this.readCredentialsFile(file, parserFunc, callback);
    }

    readCredentialsFile(file: File, parserFunc: FileParserCallback,
            callback: CredentialParserCallback): void {
        const reader: FileReader = new FileReader();
        reader.onloadend = function(e) { parserFunc(reader.result as string, callback); };
        reader.onerror = function(e) { console.log(e); };
        reader.readAsText(file);
    }

    parseOpenstackCreds(content: string, callback: CredentialParserCallback) {
        const creds = new OpenStackCredentials();
        creds.os_project_name = CredentialParser.extractValueByKey('OS_PROJECT_NAME', content) ||
                            CredentialParser.extractValueByKey('OS_TENANT_NAME', content);
        creds.os_username = CredentialParser.extractValueByKey('OS_USERNAME', content);
        creds.os_password = CredentialParser.extractValueByKey('OS_PASSWORD', content);
        creds.os_user_domain_name = CredentialParser.extractValueByKey('OS_USER_DOMAIN_NAME', content);
        creds.os_project_domain_name = CredentialParser.extractValueByKey('OS_PROJECT_DOMAIN_NAME', content) ||
                                    CredentialParser.extractValueByKey('OS_PROJECT_DOMAIN_ID', content);

        callback(creds);
    }

    parseAWSCreds(content: string, callback: CredentialParserCallback) {
        const creds = new AWSCredentials();
        creds.aws_access_key = CredentialParser.extractValueByKey('ACCESS_KEY', content);
        creds.aws_secret_key = CredentialParser.extractValueByKey('SECRET_KEY', content);

        callback(creds);
    }

    parseAzureCreds(content: string, callback: CredentialParserCallback) {
        const creds = new AzureCredentials();
        creds.azure_subscription_id = CredentialParser.extractValueByKey('AZURE_SUBSCRIPTION_ID', content);
        creds.azure_client_id = CredentialParser.extractValueByKey('AZURE_CLIENT_ID', content);
        creds.azure_secret = CredentialParser.extractValueByKey('AZURE_SECRET', content);
        creds.azure_tenant = CredentialParser.extractValueByKey('AZURE_TENANT', content);
        creds.azure_resource_group = CredentialParser.extractValueByKey('AZURE_RESOURCE_GROUP', content);
        creds.azure_storage_account = CredentialParser.extractValueByKey('AZURE_STORAGE_ACCOUNT', content);
        creds.azure_vm_default_username = CredentialParser.extractValueByKey('AZURE_VM_DEFAULT_USERNAME', content);

        callback(creds);
    }

    parseGCPCreds(content: string, callback: CredentialParserCallback) {
        const creds = new GCPCredentials();
        creds.gcp_service_creds_dict = content;

        callback(creds);
    }

}
