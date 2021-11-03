import { Base } from '../base';
import { Reference } from '../common';

export interface AssessmentTask {
  id: string;
  name: string;
  reference: Reference;
}

export interface Assessment extends Base {
  name: string;
  video: string;
  cover_image: string;
  thumbnail_image: string;
  description?: string;
  tasks: AssessmentTask[];
}
