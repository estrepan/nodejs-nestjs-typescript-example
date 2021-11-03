import { Change, EventContext } from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Timestamp } from '@google-cloud/firestore';
import { eventTrigger } from '../common';
import { Annotation, CoachStatistics, Trigger, SegmentSubmission } from '../interfaces';
import { StatusEnum } from '../enums';

export class AnnotationsTrigger {
  public async onCreate(snapshot: admin.firestore.QueryDocumentSnapshot, context: EventContext, app: admin.app.App): Promise<void> {
    const annotation: Annotation = snapshot.data() as Annotation;
    const coachStatisticsSnapshot: admin.firestore.DocumentSnapshot = await app.firestore()
      .collection('projects')
      .doc(context.params.projectId)
      .collection('coachStatistics')
      .doc(context.params.coachStatisticsId)
      .get();

    if (coachStatisticsSnapshot.exists) {
      const coachStatistics: CoachStatistics = coachStatisticsSnapshot.data() as CoachStatistics;

      if (annotation.status === StatusEnum.CREATED && coachStatistics.pending_review > 0) {
        await coachStatisticsSnapshot.ref.update({
          pending_review: coachStatistics.pending_review - 1,
          updated_at: Timestamp.now(),
          updated_by: annotation.updated_by,
        });
      }
    } else {
      await coachStatisticsSnapshot.ref.set({
        pending_review: 0,
        updated_at: Timestamp.now(),
        updated_by: annotation.updated_by,
      });
    }
  }

  public async onUpdate(change: Change<Annotation>, context: EventContext, app: admin.app.App): Promise<any> {
    const segmentSubmissionSnapshot: admin.firestore.DocumentSnapshot = await app.firestore()
      .collection('projects')
      .doc(context.params.projectId)
      .collection('segmentSubmissions')
      .doc(change.after.segment_submission_id)
      .get();

    if (segmentSubmissionSnapshot.exists) {
      const segmentSubmission: SegmentSubmission = segmentSubmissionSnapshot.data() as SegmentSubmission;
      const coachStatisticsSnapshot: admin.firestore.DocumentSnapshot = await app
        .firestore()
        .collection('projects')
        .doc(context.params.projectId)
        .collection('coachStatistics')
        .doc(segmentSubmission.coach_id)
        .get();

      if (coachStatisticsSnapshot.exists) {
        const coachStatistics: CoachStatistics = coachStatisticsSnapshot.data() as CoachStatistics;

        if (change.before.status === StatusEnum.CREATED && change.after.status === StatusEnum.REVIEWED && coachStatistics.pending_review > 0) {
          await coachStatisticsSnapshot.ref.update({
            pending_review: coachStatistics.pending_review - 1,
            updated_at: Timestamp.now(),
            updated_by: change.after.updated_by,
          });
        }
      } else {
        await coachStatisticsSnapshot.ref.set({
          pending_review: 1,
          updated_at: Timestamp.now(),
          updated_by: change.after.updated_by,
        });
      }
    }
  }
}

export const annotations: Trigger = {
  onCreate: eventTrigger(
    'onCreate',
    'projects/{projectId}/coachStatistics/{coachStatisticsId}/annotations/{annotationId}',
    AnnotationsTrigger.prototype.onCreate,
  ),
  onUpdate: eventTrigger(
    'onUpdate',
    'projects/{projectId}/coachStatistics/{coachStatisticsId}/annotations/{annotationId}',
    AnnotationsTrigger.prototype.onUpdate,
  ),
};
