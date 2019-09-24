# gql/loaders.py
from collections import defaultdict
from promise import Promise
from promise.dataloader import DataLoader
from django.db.models import Q

from dashboard.models import Course, User, Assignment, Submission, \
    AssignmentGroups, AssignmentWeightConsideration, UserDefaultSelection

import logging
logger = logging.getLogger(__name__)

class AssignmentsByCourseIdLoader(DataLoader):
    def batch_load_fn(self, keys):
        results = defaultdict(list)

        for result in Assignment.objects.filter(course_id__in=keys).iterator():
            results[result.course_id].append(result)

        return Promise.resolve([results.get(key, []) for key in keys])

class AssignmentByCourseIdAndIdLoader(DataLoader):
    # overwrite get_cache_key since it doesn't handle dictionaries
    def get_cache_key(self, key):  # type: ignore
        return f"course_id:{key.get('course_id')}|id:{key.get('id')}"

    def batch_load_fn(self, keys):
        results = defaultdict(None)

        queries = [
            Q(course_id=key.get('course_id')) & Q(id=key.get('id')) for key in keys
        ]

        if len(queries) > 0:
            query = queries.pop()
            for item in queries:
                query |= item

            for result in Assignment.objects.filter(query).iterator():
                results[f"course_id:{result.course_id}|id:{result.id}"] = result

        return Promise.resolve([
            results.get(self.get_cache_key(key)) for key in keys
        ])

class AssignmentsByAssignmentGroupIdLoader(DataLoader):
    def batch_load_fn(self, keys):
        results = defaultdict(list)

        for result in Assignment.objects.filter(assignment_group_id__in=keys).iterator():
            results[result.assignment_group_id].append(result)

        return Promise.resolve([results.get(key, []) for key in keys])

class AssignmentByAssignmentGroupIdAndIdLoader(DataLoader):
    # overwrite get_cache_key since it doesn't handle dictionaries
    def get_cache_key(self, key):  # type: ignore
        return f"assignment_group_id:{key.get('assignment_group_id')}|id:{key.get('id')}"

    def batch_load_fn(self, keys):
        results = defaultdict(None)

        queries = [
            Q(assignment_group_id=key.get('assignment_group_id')) & Q(id=key.get('id')) for key in keys
        ]

        if len(queries) > 0:
            query = queries.pop()
            for item in queries:
                query |= item

            for result in Assignment.objects.filter(query).iterator():
                results[f"assignment_group_id:{result.assignment_group_id}|id:{result.id}"] = result

        return Promise.resolve([
            results.get(self.get_cache_key(key)) for key in keys
        ])

class SubmissionsByAssignmentIdLoader(DataLoader):
    def batch_load_fn(self, keys):
        results = defaultdict(list)

        for result in Submission.objects.filter(assignment_id__in=keys).iterator():
            results[result.assignment_id].append(result)

        return Promise.resolve([results.get(key, []) for key in keys])

class SubmissionByAssignmentIdAndUserIdLoader(DataLoader):
    # overwrite get_cache_key since it doesn't handle dictionaries
    def get_cache_key(self, key):  # type: ignore
        return f"assignment_id:{key.get('assignment_id')}|user_id:{key.get('user_id')}"

    def batch_load_fn(self, keys):
        results = defaultdict(None)

        queries = [
            Q(assignment_id=key.get('assignment_id')) & Q(user_id=key.get('user_id')) for key in keys
        ]

        if len(queries) > 0:
            query = queries.pop()
            for item in queries:
                query |= item

            for result in Submission.objects.filter(query).iterator():
                results[f"assignment_id:{result.assignment_id}|user_id:{result.user_id}"] = result

        return Promise.resolve([
            results.get(self.get_cache_key(key)) for key in keys
        ])

class AssignmentGroupsByCourseIdLoader(DataLoader):
    def batch_load_fn(self, keys):
        results = defaultdict(list)

        for result in AssignmentGroups.objects.filter(course_id__in=keys).iterator():
            results[result.course_id].append(result)

        return Promise.resolve([results.get(key, []) for key in keys])


class AssignmentGroupByCourseIdAndIdLoader(DataLoader):
    # overwrite get_cache_key since it doesn't handle dictionaries
    def get_cache_key(self, key):  # type: ignore
        return f"course_id:{key.get('course_id')}|id:{key.get('id')}"

    def batch_load_fn(self, keys):
        results = defaultdict(None)

        queries = [
            Q(course_id=key.get('course_id')) & Q(id=key.get('id')) for key in keys
        ]

        if len(queries) > 0:
            query = queries.pop()
            for item in queries:
                query |= item

            for result in AssignmentGroups.objects.filter(query).iterator():
                results[f"course_id:{result.course_id}|id:{result.id}"] = result

        return Promise.resolve([
            results.get(self.get_cache_key(key)) for key in keys
        ])


class AssignmentWeightConsiderationByCourseIdLoader(DataLoader):
    def batch_load_fn(self, keys):
        results = defaultdict(None)

        for result in AssignmentWeightConsideration.objects.filter(course_id__in=keys).iterator():
            results[result.course_id] = result

        return Promise.resolve([results.get(key, None) for key in keys])

class UserDefaultSelectionsByCourseIdAndUserLoader(DataLoader):
    # overwrite get_cache_key since it doesn't handle dictionaries
    def get_cache_key(self, key):  # type: ignore
        return f"course_id:{key.get('course_id')}|user_sis_name:{key.get('user_sis_name')}"

    def batch_load_fn(self, keys):
        results = defaultdict(list)

        queries = [
            Q(course_id=key.get('course_id')) & Q(user_sis_name=key.get('user_sis_name')) for key in keys
        ]

        if len(queries) > 0:
            query = queries.pop()
            for item in queries:
                query |= item

            for result in UserDefaultSelection.objects.filter(query).iterator():
                results[f"course_id:{result.course_id}|user_sis_name:{result.user_sis_name}"].append(result)

        return Promise.resolve([
            results.get(self.get_cache_key(key), []) for key in keys
        ])

class UserDefaultSelectionByCourseIdAndUserAndViewTypeLoader(DataLoader):
    # overwrite get_cache_key since it doesn't handle dictionaries
    def get_cache_key(self, key):  # type: ignore
        return f"course_id:{key.get('course_id')}|user_sis_name:{key.get('user_sis_name')}|default_view_type:{key.get('default_view_type')}"

    def batch_load_fn(self, keys):
        results = defaultdict(None)

        queries = [
            Q(course_id=key.get('course_id')) & Q(user_sis_name=key.get('user_sis_name')) & Q(default_view_type=key.get('default_view_type')) for key in keys
        ]

        if len(queries) > 0:
            query = queries.pop()
            for item in queries:
                query |= item

            for result in UserDefaultSelection.objects.filter(query).iterator():
                results[f"course_id:{result.course_id}|user_sis_name:{result.user_sis_name}|default_view_type:{result.default_view_type}"] = result

        return Promise.resolve([
            results.get(self.get_cache_key(key)) for key in keys
        ])