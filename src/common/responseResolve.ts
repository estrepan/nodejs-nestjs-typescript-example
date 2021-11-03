import * as _ from 'lodash';
import { Response } from './response';

export function responseResolve(
  data: any,
  statusCode: number = 200,
  error: string = null,
  message: string | string[] = null,
): Response {
  return {
    data: data instanceof Object && !Array.isArray(data) ? _.mapKeys(data, (value: any, key: any) => _.camelCase(key)) : data,
    error,
    message,
    statusCode,
  };
}
