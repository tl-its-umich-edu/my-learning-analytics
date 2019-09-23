from graphene_django.views import GraphQLView
from dashboard.graphql.loaders import AssignmentsByCourseIdLoader, \
    SubmissionsByAssignmentIdLoader

class DashboardGraphQLView(GraphQLView):
    def get_context(self, request):
        loaders = {
            'assignments_by_course_id_loader': AssignmentsByCourseIdLoader(),
            'submissions_by_assignment_id_loader': SubmissionsByAssignmentIdLoader(),
        }
        for method_, instance in loaders.items():
            setattr(request, method_, instance)
        return request