import { Base } from '../base';

export interface Task extends Base {
  name: string;
  video: string;
  steps_description?: string;
  steps_title?: string;
  description?: string;
  short_description?: string;
}
