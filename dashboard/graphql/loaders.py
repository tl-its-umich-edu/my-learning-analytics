# gql/loaders.py
from collections import defaultdict
from promise import Promise
from promise.dataloader import DataLoader
from dashboard.models import Course, User, Assignment, Submission

class AssignmentsByCourseIdLoader(DataLoader):
    def batch_load_fn(self, keys):
        results = defaultdict(list)

        for result in Assignment.objects.filter(course_id__in=keys).iterator():
            results[result.course_id].append(result)

        return Promise.resolve([results.get(key, []) for key in keys])

class SubmissionsByAssignmentIdLoader(DataLoader):
    def batch_load_fn(self, keys):
        results = defaultdict(list)

        for result in Submission.objects.filter(assignment_id__in=keys).iterator():
            results[result.assignment_id].append(result)

        return Promise.resolve([results.get(key, []) for key in keys])