from django.db import connection as conn
from django.conf import settings

def course_name(request):
    course_id = str(settings.UDW_ID_PREFIX) + str(request.resolver_match.kwargs.get('course_id'))
    course_name = "Course Not Found"
    if (course_id): 
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM course WHERE id = %s", [course_id])
        row = cursor.fetchone()
        if (row != None):
            course_name = row[0]

    return {'course_name': course_name}
