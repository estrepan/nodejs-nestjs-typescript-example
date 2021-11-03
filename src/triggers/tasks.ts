import { Change, EventContext } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { eventTrigger } from '../common';
import { Assessment, AssessmentTask, Task, Trigger } from '../interfaces';

export class TaskTriggers {
  public async onUpdate(change: Change<Task>, context: EventContext, app: admin.app.App): Promise<any> {
    const batch: admin.firestore.WriteBatch = app.firestore().batch();

    await app.firestore()
      .collection('projects')
      .doc(context.params.projectId)
      .collection('assessments')
      .get()
      .then((data: admin.firestore.QuerySnapshot) => {
        if (!data.empty) {
          data.docs.forEach((doc: admin.firestore.QueryDocumentSnapshot<Assessment>) => {
            let needToUpdate: boolean = false;

            const tasks: AssessmentTask[] = doc.data().tasks.map((task: AssessmentTask) => {
              if (task.id === change.after.id) {
                task.name = change.after.name;
                needToUpdate = true;
              }

              return task;
            });

            if (needToUpdate) {
              batch.set(doc.ref, { tasks }, { merge: true });
            }
          });
        }
      });

    await batch.commit();
  }
}

export const tasks: Trigger = {
  onWrite: eventTrigger(
    'onUpdate',
    'projects/{projectId}/tasks/{taskId}',
    TaskTriggers.prototype.onUpdate,
  ),
};
