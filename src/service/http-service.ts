export class HttpService {
  static accessKey: string;

  static getHeaders() {
    return {
      "cloudlab-api-access-key": this.accessKey,
    };
  }
}
