import { HttpResponse } from "./http-response";

export class AxiosResponse {
  config: any;
  request: any;
  headers: any;
  status!: number;
  statusText!: string;
  data!: HttpResponse;
}
