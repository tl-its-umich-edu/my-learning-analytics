import json
import logging
import math
from collections import namedtuple
from datetime import timedelta
from json import JSONDecodeError

import jsonschema
import numpy as np
import pandas as pd
from django.conf import settings
from django.contrib import auth
from django.core.exceptions import ObjectDoesNotExist
from django.db import connection as conn
from django.forms.models import model_to_dict
from django.http import HttpResponse, HttpResponseForbidden, JsonResponse
from django.shortcuts import redirect, render
from django.utils import timezone
from pinax.eventlog.models import log as eventlog
from rules.contrib.views import permission_required, objectgetter

from dashboard.common import utils
from dashboard.common.db_util import canvas_id_to_incremented_id
from dashboard.event_logs_types.event_logs_types import EventLogTypes
from dashboard.models import Course, CourseViewOption, Resource, UserDefaultSelection, User
from dashboard.settings import COURSES_ENABLED, RESOURCE_VALUES, RESOURCE_VALUES_MAP, \
    RESOURCE_ACCESS_CONFIG

logger = logging.getLogger(__name__)
# strings for construct resource download url

CANVAS_FILE_ID_NAME_SEPARATOR = "|"

# string for no grade
GRADE_A="90-100"
GRADE_B="80-89"
GRADE_C="70-79"
GRADE_LOW="low_grade"
NO_GRADE_STRING = "NO_GRADE"

# string for resource type
RESOURCE_TYPE_STRING = "resource_type"


def gpa_map(grade):
    if grade is None:
        return NO_GRADE_STRING
    # convert to float
    grade_float = float(grade)
    if grade_float >= 90:
        return GRADE_A
    elif grade_float >=80:
        return GRADE_B
    elif grade_float >=70:
        return GRADE_C
    else:
        return GRADE_LOW


def get_home_template(request):
    return render(request, 'frontend/index.html')

def view_names_mapping():
    view_column_names: dict = {
        'ap': CourseViewOption.show_assignment_planning.field.column,
        'apv1': CourseViewOption.show_assignment_planning_v1.field.column,
        'gd': CourseViewOption.show_grade_distribution.field.column,
        'ra': CourseViewOption.show_resources_accessed.field.column
    }
    return view_column_names


def get_course_view_options(is_admin, course):
    view_column_names: dict = view_names_mapping()
    global_views_disabled = []
    for view in settings.VIEWS_DISABLED:
        if view in view_column_names.values():
            global_views_disabled.append((list(view_column_names.keys()))[list(view_column_names.values()).index(view)])
    admin_course_views = CourseViewOption.objects.get(course=course).json(include_id=False)
    course_view_options = {key: value for key, value in admin_course_views.items() if key not in global_views_disabled}
    return admin_course_views if is_admin else course_view_options



@permission_required('dashboard.get_course_info',
    fn=objectgetter(Course, 'course_id', 'canvas_id'), raise_exception=True)
def get_course_info(request, course_id=0):
    """Returns JSON data about a course

    :param request: HTTP Request
    :type request: Request
    :param course_id: Unizin Course ID, defaults to 0
    :param course_id: int, optional
    :return: JSON to be used
    :rtype: str
    """
    course_id = canvas_id_to_incremented_id(course_id)
    today = timezone.now()

    try:
        course = Course.objects.get(id=course_id)
    except ObjectDoesNotExist:
        return HttpResponse("{}")

    course_resource_list = []
    try:
        resource_list = Resource.objects.get_course_resource_type(course_id)
        if resource_list is not None:
            logger.info(f"Course {course_id} resources data type are: {resource_list}")
            resource_defaults = RESOURCE_VALUES
            for item in resource_list:
                result = utils.search_key_for_resource_value(resource_defaults, item)
                if result is not None:
                    course_resource_list.append(result.capitalize())
            logger.info(f"Mapped generic resource types in a course {course_id}: {course_resource_list}")
    except(ObjectDoesNotExist,Exception) as e:
        logger.info(f"getting the course {course_id} resources types has errors due to:{e}")

    course_resource_list = list(dict.fromkeys(course_resource_list))

    course_resource_list.sort()

    temp_append_resource_icon_list = list()

    for resource in course_resource_list:
        course_resource_dict = dict()
        course_resource_dict['label'] = resource
        course_resource_dict['icon'] = RESOURCE_VALUES[resource.lower()]['icon']
        temp_append_resource_icon_list.append(course_resource_dict)

    course_resource_list = temp_append_resource_icon_list

    resp = model_to_dict(course)

    course_start, course_end = course.course_date_range

    current_week_number = math.ceil((today - course_start).days/7)
    total_weeks = math.ceil((course_end - course_start).days/7)

    if course.term is not None:
        resp['term'] = model_to_dict(course.term)
    else:
        resp['term'] = None

    # Have a fixed maximum number of weeks
    if total_weeks > settings.MAX_DEFAULT_WEEKS:
        logger.debug(f'{total_weeks} is greater than {settings.MAX_DEFAULT_WEEKS} setting total weeks to default.')
        total_weeks = settings.MAX_DEFAULT_WEEKS
    resp['current_week_number'] = current_week_number
    resp['total_weeks'] = total_weeks
    resp['course_view_options'] = get_course_view_options(request.user.is_staff, course)
    resp['resource_types'] = course_resource_list
    resp['course_data_loaded'] = 1 if course.term_id else 0

    return HttpResponse(json.dumps(resp, default=str))


@permission_required('dashboard.update_course_info',
                     fn=objectgetter(Course, 'course_id', 'canvas_id'), raise_exception=True)
def update_course_info(request, course_id=0):
    """

    :param request: HTTP `PUT` req.; body should contain the JSON body…
    :param course_id: Integer Canvas course ID number, typically six digits or less.
    :return: JsonResponse containing `{"default": "success"}` or `{"default": "fail"}`
    """
    logger.info(update_course_info.__name__)

    if (request.method != 'PUT'):
        return JsonResponse({'error': 'Invalid request method.'}, status=400)

    course_id = canvas_id_to_incremented_id(course_id)
    current_user = request.user.get_username()

    bad_json_response = JsonResponse({'error': 'Request JSON malformed.'}, status=400)

    try:
        request_data: dict = json.loads(request.body.decode('utf-8'))
    except JSONDecodeError:
        return bad_json_response

    schema = {'$schema': 'http://json-schema.org/draft-07/schema',
              'type': 'object',
              'additionalProperties': False,
              'properties': {
                  'ap': {
                      'type': 'object',
                      'required': ['enabled'],
                      'additionalProperties': False,
                      'properties': {'enabled': {'type': 'boolean'}}},
                  'apv1': {
                      'type': 'object',
                      'required': ['enabled'],
                      'additionalProperties': False,
                      'properties': {'enabled': {'type': 'boolean'}}},
                  'gd': {
                      'type': 'object',
                      'required': ['enabled'],
                      'additionalProperties': False,
                      'properties': {'enabled': {'type': 'boolean'},
                                     'show_grade_counts': {'type': 'boolean'}}},
                  'ra': {
                      'type': 'object',
                      'required': ['enabled'],
                      'additionalProperties': False,
                      'properties': {'enabled': {'type': 'boolean'}}}},
              'minProperties': 1}

    try:
        jsonschema.validate(request_data, schema)
    except jsonschema.ValidationError:
        return bad_json_response

    # to translate short names returned by model back to original column names
    view_column_names: dict = view_names_mapping()

    view_settings: dict
    view_data: dict = {}
    success: bool = True  # always look on the bright side of life

    try:
        for (view_key, view_settings) in request_data.items():
            view_data[view_column_names[view_key]] = view_settings['enabled']
            if (view_key == 'gd' and 'show_grade_counts' in view_settings.keys()):
                Course.objects.filter(pk=course_id).update(
                    show_grade_counts=view_settings['show_grade_counts'])

        CourseViewOption.objects.filter(pk=course_id).update(**view_data)
    except (ObjectDoesNotExist, Exception) as e:
        logger.info(
            f'updating course visualization options failed due to {e} for user {current_user} in course {course_id}')
        success = False

    return JsonResponse({'default': 'success' if success else 'fail'},
                        status=200 if success else 500)


# show percentage of users who read the resource within prior n weeks
@permission_required('dashboard.resource_access_within_week',
    fn=objectgetter(Course, 'course_id','canvas_id'), raise_exception=True)
def resource_access_within_week(request, course_id=0):

    course_id = canvas_id_to_incremented_id(course_id)

    current_user = request.user.get_username()

    logger.debug("current_user=" + current_user)

    # environment settings:
    df_default_display_settings()

    # read quefrom request param
    week_num_start = int(request.GET.get('week_num_start','1'))
    week_num_end = int(request.GET.get('week_num_end','0'))
    grade = request.GET.get('grade','all')
    filter_values = request.GET.get(RESOURCE_TYPE_STRING, ['files', 'videos'])
    filter_values = filter_values.split(",")

    filter_list = []
    for filter_value in filter_values:
        if filter_value != '':
            filter_list.extend(RESOURCE_VALUES[filter_value.lower()]['types'])

    # json for eventlog
    data = {
        "week_num_start": week_num_start,
        "week_num_end": week_num_end,
        "grade": grade,
        "course_id": course_id,
        "resource_type": filter_values
    }
    eventlog(request.user, EventLogTypes.EVENT_VIEW_RESOURCE_ACCESS.value, extra=data)


    # get total number of student within the course_id
    total_number_student_sql = "select count(*) from user where course_id = %(course_id)s and enrollment_type='StudentEnrollment'"
    if (grade == GRADE_A):
        total_number_student_sql += " and current_grade >= 90"
    elif (grade == GRADE_B):
        total_number_student_sql += " and current_grade >= 80 and current_grade < 90"
    elif (grade == GRADE_C):
        total_number_student_sql += " and current_grade >= 70 and current_grade < 80"

    total_number_student_df = pd.read_sql(total_number_student_sql, conn, params={"course_id": course_id})
    total_number_student = total_number_student_df.iloc[0,0]
    logger.info(f"course_id {course_id} total student={total_number_student}")
    if total_number_student == 0:
        logger.info(f"There are no students in the percent grade range {grade} for course {course_id}")
        return HttpResponse("{}")

    course_date_start = get_course_date_start(course_id)

    start = course_date_start + timedelta(days=(week_num_start * 7))
    end = course_date_start + timedelta(days=(week_num_end * 7))
    logger.debug("course_start=" + str(course_date_start) + " start=" + str(start) + " end=" + str(end))

    # get time range based on week number passed in via request

    sqlString = f"""SELECT a.resource_id as resource_id, r.resource_type as resource_type, r.name as resource_name, u.current_grade as current_grade, a.user_id as user_id
                    FROM resource r, resource_access a, user u, course c, academic_terms t
                    WHERE a.resource_id = r.resource_id and a.user_id = u.user_id
                    and a.course_id = c.id and c.term_id = t.id
                    and a.access_time > %(start_time)s
                    and a.access_time < %(end_time)s
                    and a.course_id = %(course_id)s
                    and u.course_id = %(course_id)s
                    and u.enrollment_type = 'StudentEnrollment' """

    startTimeString = start.strftime('%Y%m%d') + "000000"
    endTimeString = end.strftime('%Y%m%d') + "000000"
    logger.debug(sqlString)
    logger.debug("start time=" + startTimeString + " end_time=" + endTimeString)
    df = pd.read_sql(sqlString, conn, params={"start_time": startTimeString,"end_time": endTimeString, "course_id": course_id})
    logger.debug(df)

    # return if there is no data during this interval
    if (df.empty):
        return HttpResponse("{}")

    # group by resource_id, and resource_name
    # reformat for output
    df['resource_id_name'] = df['resource_id'].astype(str).str.cat(df['resource_name'], sep=';')

    df=df.drop(['resource_id', 'resource_name'], axis=1)
    df.set_index(['resource_id_name'])
    # drop resource records when the resource has been accessed multiple times by one user
    df.drop_duplicates(inplace=True)

    # map point grade to letter grade
    df['grade'] = df['current_grade'].map(gpa_map)

    # calculate the percentage
    df['percent'] = df.groupby(['resource_id_name', 'grade'])['resource_id_name'].transform('count') / total_number_student

    df=df.drop(['current_grade', 'user_id'], axis=1)
    # now only keep the resource access stats by grade level
    df.drop_duplicates(inplace=True)

    resource_id_name=df["resource_id_name"].unique()

    #df.reset_index(inplace=True)

    # zero filled dataframe with resource name as row name, and grade as column name
    output_df=pd.DataFrame(0.0, index=resource_id_name, columns=[GRADE_A, GRADE_B, GRADE_C, GRADE_LOW, NO_GRADE_STRING, RESOURCE_TYPE_STRING])
    output_df=output_df.rename_axis('resource_id_name')
    output_df=output_df.astype({RESOURCE_TYPE_STRING: str})

    for index, row in df.iterrows():
        # set value
        output_df.at[row['resource_id_name'], row['grade']] = row['percent']
        output_df.at[row['resource_id_name'], RESOURCE_TYPE_STRING] = row[RESOURCE_TYPE_STRING]
    output_df.reset_index(inplace=True)

    # now insert person's own viewing records: what resources the user has viewed, and the last access timestamp
    selfSqlString = f"""select CONCAT(r.resource_id, ';', r.name) as resource_id_name, count(*) as self_access_count, max(a.access_time) as self_access_last_time 
                    from resource_access a, user u, resource r 
                    where a.user_id = u.user_id 
                    and a.resource_id = r.resource_id 
                    and u.sis_name=%(current_user)s 
                    and a.course_id = %(course_id)s
                    group by CONCAT(r.resource_id, ';', r.name)"""
    logger.debug(selfSqlString)
    logger.debug("current_user=" + current_user)

    selfDf= pd.read_sql(selfSqlString, conn, params={"current_user":current_user, "course_id": course_id})

    output_df = output_df.join(selfDf.set_index('resource_id_name'), on='resource_id_name', how='left')
    output_df["total_percent"] = output_df.apply(lambda row: row[GRADE_A] + row[GRADE_B] + row[GRADE_C] + row[GRADE_LOW] + row.NO_GRADE, axis=1)

    if (grade != "all"):
        # drop all other grades
        grades = [GRADE_A, GRADE_B, GRADE_C, GRADE_LOW, NO_GRADE_STRING]
        for i_grade in grades:
            if (i_grade==grade):
                output_df["total_percent"] = output_df[i_grade]
            else:
                output_df=output_df.drop([i_grade], axis=1)

    output_df=output_df[output_df.resource_type.isin(filter_list)]

    # if no checkboxes are checked send nothing
    if (output_df.empty):
        return HttpResponse("{}")

    # only keep rows where total_percent > 0
    output_df = output_df[output_df.total_percent > 0]

    # time 100 to show the percentage
    output_df["total_percent"] *= 100
    # round all numbers to whole numbers
    output_df = output_df.round(0)

    output_df.fillna(0, inplace=True) #replace null value with 0

    output_df[['resource_id_part','resource_name_part']] = output_df['resource_id_name'].str.split(';', expand=True)

    # Temporary workaround to include empty links for resources that don't fit resource link pattern
    # For example, Canvas page views do not fit this convention
    # <url_prefix> + <resource_id> + <url_postfix>
    if RESOURCE_ACCESS_CONFIG.get(row.resource_type).get("urls").get("prefix") is None:
        output_df['resource_name'] = output_df.apply(
            lambda row:
                ('' +
                CANVAS_FILE_ID_NAME_SEPARATOR +
                row.resource_name_part + CANVAS_FILE_ID_NAME_SEPARATOR +
                RESOURCE_VALUES.get(RESOURCE_VALUES_MAP.get(row.resource_type)).get('icon')
                ),
            axis=1)
    else:    
        output_df['resource_name'] = output_df.apply(
            lambda row:
                (RESOURCE_ACCESS_CONFIG.get(row.resource_type).get("urls").get("prefix") +
                row.resource_id_part +
                RESOURCE_ACCESS_CONFIG.get(row.resource_type).get("urls").get("postfix") +
                CANVAS_FILE_ID_NAME_SEPARATOR +
                row.resource_name_part + CANVAS_FILE_ID_NAME_SEPARATOR +
                RESOURCE_VALUES.get(RESOURCE_VALUES_MAP.get(row.resource_type)).get('icon')
                ),
            axis=1)
    # RESOURCE_VALUES_MAP {'canvas': 'files', 'leccap': 'videos', 'mivideo': 'videos'}
    output_df['resource_type'] = output_df['resource_type'].replace(RESOURCE_VALUES_MAP)
    output_df.drop(columns=['resource_id_part', 'resource_name_part', 'resource_id_name'], inplace=True)

    logger.debug(output_df.to_json(orient='records'))

    return HttpResponse(output_df.to_json(orient='records'),content_type='application/json')


@permission_required('dashboard.grade_distribution',
    fn=objectgetter(Course, 'course_id','canvas_id'), raise_exception=True)
def grade_distribution(request, course_id=0):
    logger.info(grade_distribution.__name__)

    course_id = canvas_id_to_incremented_id(course_id)

    current_user = request.user.get_username()

    grade_score_sql = f"""select current_grade,
       (select show_grade_counts From course where id=%(course_id)s) as show_number_on_bars,
    (select current_grade from user where sis_name=%(current_user)s and course_id=%(course_id)s) as current_user_grade
        from user where course_id=%(course_id)s and enrollment_type='StudentEnrollment';
                    """
    df = pd.read_sql(grade_score_sql, conn, params={"current_user": current_user, 'course_id': course_id})
    if df.empty or df.count().current_grade < 6:
        logger.info(f"Not enough students grades (only {df.count().current_grade}) in a course {course_id} to show the view")
        return HttpResponse(json.dumps({}), content_type='application/json')

    grade_view_data = dict()
    summary = dict()
    summary['current_user_grade'] = df['current_user_grade'].values[0]
    summary['tot_students'] = df.shape[0]
    df = df[df['current_grade'].notnull()]
    df['current_grade'] = df['current_grade'].astype(float)
    summary['grade_avg'] = df['current_grade'].mean().round(2)
    summary['median_grade'] = df['current_grade'].median().round(2)
    summary['show_number_on_bars'] = False
    if df['show_number_on_bars'].values[0] == 1:
        summary['show_number_on_bars'] = True

    df.sort_values(by=['current_grade'], inplace=True)
    df.reset_index(drop=True, inplace=True)
    grades = df['current_grade'].values.tolist()
    logger.debug(f"Grades distribution: {grades}")
    BinningGrade = find_binning_grade_value(grades)
    if BinningGrade is not None and not BinningGrade.binning_all:
        df['current_grade'] = df['current_grade'].replace(df['current_grade'].head(BinningGrade.index),
                                                      BinningGrade.value)
    summary['show_dash_line'] = show_dashed_line(df['current_grade'].iloc[0], BinningGrade)
    
    if df[df['current_grade'] > 100.0].shape[0] > 0:
        summary['graph_upper_limit'] = int((5 * round(float(df['current_grade'].max()) / 5) + 5))
    else:
        df['current_grade'] = df['current_grade'].apply(lambda x: 99.99 if x == 100.00 else x)
        summary['graph_upper_limit'] = 100

    grade_view_data['summary'] = summary
    grade_view_data['grades'] = df['current_grade'].values.tolist()

    # json for eventlog
    data = {
        "course_id": course_id,
        "show_number_on_bars": df['show_number_on_bars'].values[0]
    }
    eventlog(request.user, EventLogTypes.EVENT_VIEW_GRADE_DISTRIBUTION.value, extra=data)

    return HttpResponse(json.dumps(grade_view_data))


@permission_required('dashboard.update_user_default_selection_for_views',
    fn=objectgetter(Course, 'course_id','canvas_id'), raise_exception=True)
def update_user_default_selection_for_views(request, course_id=0):
    """

    :param request: HTTP `PUT` req.; body should contain a single JSON pair, `{"key": value}`
    :param course_id: Integer Canvas course ID number, typically six digits or less.
    :return: HttpResponse containing `{"default": "success"}` or `{"default": "fail"}`
    """
    logger.info(update_user_default_selection_for_views.__name__)
    course_id = canvas_id_to_incremented_id(course_id)
    current_user = request.user.get_username()
    default_selection = json.loads(request.body.decode("utf-8"))
    logger.info(default_selection)
    default_type = list(default_selection.keys())[0]
    default_type_value = default_selection.get(default_type)
    logger.info(f"request to set default for type: {default_type} and default_type value: {default_type_value}")
    # json for eventlog
    data = {
        "course_id": course_id,
        "default_type": default_type,
        "default_value": default_type_value
    }
    eventlog(request.user, EventLogTypes.EVENT_VIEW_SET_DEFAULT.value, extra=data)
    key = 'default'
    try:
        obj, create_or_update_bool = UserDefaultSelection.objects. \
            set_user_defaults(int(course_id), current_user, default_type, default_type_value)
        logger.info(
            f"""setting default returns with success with response {obj.__dict__} and entry created or Updated: {create_or_update_bool}
                        for user {current_user} in course {course_id} """)
        value = 'success'
    except (ObjectDoesNotExist, Exception) as e:
        logger.info(f"updating default failed due to {e} for user {current_user} in course: {course_id} ")
        value = 'fail'
    return HttpResponse(json.dumps({key: value}),content_type='application/json')


@permission_required('dashboard.get_user_default_selection',
    fn=objectgetter(Course, 'course_id','canvas_id'), raise_exception=True)
def get_user_default_selection(request, course_id=0):
    logger.info(get_user_default_selection.__name__)
    course_id = canvas_id_to_incremented_id(course_id)
    user_sis_name = request.user.get_username()
    default_view_type = request.GET.get('default_type')
    key = 'default'
    no_user_default_response = json.dumps({key: ''})
    logger.info(f"the default option request from user {user_sis_name} in course {course_id} of type: {default_view_type}")
    default_value = UserDefaultSelection.objects.get_user_defaults(int(course_id), user_sis_name, default_view_type)
    logger.info(f"""default option check returned from DB for user: {user_sis_name} course {course_id} and type:
                    {default_view_type} is {default_value}""")
    if not default_value:
        logger.info(
            f"user {user_sis_name} in course {course_id} don't have any defaults values set type {default_view_type}")
        return HttpResponse(no_user_default_response, content_type='application/json')
    result = json.dumps({key: default_value})
    logger.info(f"user {user_sis_name} in course {course_id} for type {default_view_type} defaults: {result}")
    return HttpResponse(result, content_type='application/json')


@permission_required('dashboard.assignments',
    fn=objectgetter(Course, 'course_id','canvas_id'), raise_exception=True)
def assignments(request, course_id=0):
    
    logger.info(assignments.__name__)

    course_id = canvas_id_to_incremented_id(course_id)

    current_user = request.user.get_username()
    df_default_display_settings()

    percent_selection = float(request.GET.get('percent', '0.0'))

    # json for eventlog
    data = {
        "course_id": course_id,
        "percent_selection": percent_selection
    }
    eventlog(request.user, EventLogTypes.EVENT_VIEW_ASSIGNMENT_PLANNING.value, extra=data)

    logger.info('selection from assignment Planning {}'.format(percent_selection))

    assignments_in_course = get_course_assignments(course_id)

    if assignments_in_course.empty:
        return HttpResponse(json.dumps([]), content_type='application/json')

    assignment_submissions = get_user_assignment_submission(current_user, assignments_in_course, course_id)

    df = pd.merge(assignments_in_course, assignment_submissions, on='assignment_id', how='left')
    if df.empty:
        logger.info('There are no assignment data in the course %s for user %s ' % (course_id, current_user))
        return HttpResponse(json.dumps([]), content_type='application/json')

    df.sort_values(by='due_date', inplace=True)
    df.drop(columns=['assignment_id', 'due_date','grp_id'], inplace=True)
    df.drop_duplicates(keep='first', inplace=True)

    # instructor might not ever see the avg score as he don't have grade in assignment. we don't have role described in the flow to open the gates for him
    if not request.user.is_superuser:
        df['avg_score']= df.apply(no_show_avg_score_for_ungraded_assignments, axis=1)
    df['avg_score']=df['avg_score'].fillna('Not available')

    # operate on dataframe copy to prevent Pandas "SettingWithCopyWarning" warning
    df_progressbar = df.loc[df['towards_final_grade'] > 0.0].copy()
    df_progressbar[['score']] = df_progressbar[['score']].astype(float)
    df_progressbar['graded'] = df_progressbar['graded'].fillna(False)
    df_progressbar['submitted'] = df_progressbar['submitted'].fillna(False)
    df_progressbar[['score']] = df_progressbar[['score']].astype(float)
    df_progressbar['percent_gotten'] = df_progressbar.apply(lambda x: user_percent(x), axis=1)
    df_progressbar.sort_values(by=['graded', 'due_date_mod'], ascending=[False, True], inplace=True)
    df_progressbar.reset_index(inplace=True)
    df_progressbar.drop(columns=['index'], inplace=True)

    assignment_data = {}
    assignment_data['progress'] = json.loads(df_progressbar.to_json(orient='records'))

    # Group the data according the assignment prep view
    df_plan = df.loc[df['towards_final_grade'] >= percent_selection].copy()
    df_plan.reset_index(inplace=True)
    df_plan.drop(columns=['index'], inplace=True)
    logger.debug('The Dataframe for the assignment planning %s ' % df_plan)
    grouped = df_plan.groupby(['week', 'due_dates'])

    assignment_list = []
    for name, group in grouped:
        # name is a tuple of (week,due_date) => (1,'06/23/2018')
        # group is a dataframe based on grouping by week,due_date
        dic = {}
        group.drop(['week', 'due_dates'], axis=1, inplace=True)
        dic['week'] = name[0]
        dic['due_date'] = name[1]
        dic['assign'] = json.loads(group.to_json(orient='records'))
        assignment_list.append(dic)
    week_list = set()
    for item in assignment_list:
        week_list.add(item['week'])
    weeks = sorted(week_list)
    full = []
    for i, week in enumerate(weeks):
        data = {}
        data["week"] = np.uint64(week).item()
        data["id"] = i + 1
        dd_items = data["due_date_items"] = []
        for item in assignment_list:
            assignment_due_date_grp = {}
            if item['week'] == week:
                assignment_due_date_grp['due_date'] = item['due_date']
                assignment_due_date_grp['assignment_items'] = item['assign']
                dd_items.append(assignment_due_date_grp)
        full.append(data)
    assignment_data['plan'] = json.loads(json.dumps(full))
    return HttpResponse(json.dumps(assignment_data), content_type='application/json')


def get_course_assignments(course_id):

    sql=f"""select assign.*,sub.avg_score from
            (select ifnull(assignment_id, 0) as assignment_id ,name,assign_grp_name,grp_id,due_date,points_possible,group_points,weight,drop_lowest,drop_highest from
            (select a.id as assignment_id,a.assignment_group_id, a.local_date as due_date,a.name,a.points_possible from assignment as a  where a.course_id =%(course_id)s) as app right join
            (select id, name as assign_grp_name, id as grp_id, group_points, weight,drop_lowest,drop_highest from assignment_groups where course_id=%(course_id)s) as ag on ag.id=app.assignment_group_id) as assign left join
            (select distinct assignment_id,avg_score from submission where course_id=%(course_id)s) as sub on sub.assignment_id = assign.assignment_id
            """

    assignments_in_course = pd.read_sql(sql,conn,params={'course_id': course_id}, parse_dates={'due_date': '%Y-%m-%d'})
    # No assignments found in the course
    if assignments_in_course.empty or (assignments_in_course['assignment_id'] == 0).all():
        logger.info('The course %s don\'t seems to have assignment data' % course_id)
        return pd.DataFrame()

    assignments_in_course['due_date'] = pd.to_datetime(assignments_in_course['due_date'],unit='ms')
    assignments_in_course[['points_possible','group_points']]=assignments_in_course[['points_possible','group_points']].fillna(0)
    assignments_in_course[['points_possible', 'group_points','weight']] = assignments_in_course[['points_possible', 'group_points','weight']].astype(float)
    consider_weight=is_weight_considered(course_id)
    df_assignment = assignments_in_course[['weight','group_points','grp_id']].drop_duplicates().copy()
    hidden_assignments = are_weighted_assignments_hidden(course_id, df_assignment)
    total_points=assignments_in_course['points_possible'].sum()
    # if assignment group is weighted and no assignments added yet then assignment name will be nothing so situation is specific to that
    if hidden_assignments:
        assignments_in_course['name'] = assignments_in_course['name'].fillna(assignments_in_course['assign_grp_name']+' Group Unavailable Assignments')
    assignments_in_course['towards_final_grade']=assignments_in_course.apply(lambda x: percent_calculation(consider_weight, total_points,hidden_assignments, x), axis=1)
    assignments_in_course['calender_week']=assignments_in_course['due_date'].dt.week
    assignments_in_course['calender_week']=assignments_in_course['calender_week'].fillna(0).astype(int)
    min_week=find_min_week(course_id)
    max_week=assignments_in_course['calender_week'].max()
    week_list = [x for x in range(min_week,max_week+1)]
    assignments_in_course['week']=assignments_in_course['calender_week'].apply(lambda x: 0 if x == 0 else week_list.index(x)+1)
    assignments_in_course.sort_values(by='due_date', inplace = True)
    assignments_in_course['current_week']=assignments_in_course['calender_week'].apply(lambda x: find_current_week(x))
    assignments_in_course['due_date_mod'] =assignments_in_course['due_date'].astype(str).apply(lambda x:x.split()[0])
    assignments_in_course['due_dates']= pd.to_datetime(assignments_in_course['due_date_mod']).dt.strftime('%m/%d')
    assignments_in_course['due_dates']= assignments_in_course['due_dates'].fillna('No due date')
    return assignments_in_course


def get_user_assignment_submission(current_user,assignments_in_course_df, course_id):
    sql = "select assignment_id, submitted_at, score, graded_date from submission where " \
          "user_id=(select user_id from user where sis_name = %(current_user)s and course_id = %(course_id)s ) and course_id = %(course_id)s"
    assignment_submissions = pd.read_sql(sql, conn, params={'course_id': course_id, "current_user": current_user})
    if assignment_submissions.empty:
        logger.info('The user %s seems to be a not student in the course.' % current_user)
        # manually adding the columns for display in UI
        assignment_submissions = pd.DataFrame()
        assignment_submissions['assignment_id'] = assignments_in_course_df['assignment_id']
        assignment_submissions['score'] = None
        assignment_submissions['graded'] = False
        assignment_submissions['submitted'] = False
    else:
        assignment_submissions['graded'] = assignment_submissions['graded_date'].notnull()
        assignment_submissions.drop(columns=['graded_date'], inplace=True)
        assignment_submissions['submitted'] = assignment_submissions['submitted_at'].notnull()
        assignment_submissions.drop(columns=['submitted_at'], inplace=True)
    return assignment_submissions


# don't show the avg scores for student when individual assignment is not graded as canvas currently don't show it
def no_show_avg_score_for_ungraded_assignments(row):
    if row['score'] is None:
        return 'Not available'
    else: return row['avg_score']


def user_percent(row):
    if len(row) == 0:
        return 0
    if row['graded']:
        s = round((row['score'] / row['points_possible']) * row['towards_final_grade'], 2)
        return s
    else:
        return row['towards_final_grade']


def percent_calculation(consider_weight,total_points,hidden_assignments,row):
    """
    This function handles how much % an assignment worth in a course. The cases
    includes 1. assignments groups has weights and no hidden assignments in them
    2. vanilla case default group, no weights, and irrespective if assignment are hidden or not
    3. assignment groups has weights, hidden or no assignments in them

    :param consider_weight:
    :param total_points:
    :param hidden_assignments:
    :param row:
    :return:
    """
    if hidden_assignments and consider_weight and row['group_points'] == 0:
        return round(row['weight'],2)
    if hidden_assignments and consider_weight and row['group_points'] != 0:
        return round((row['points_possible']/row['group_points'])*row['weight'],2)
    if consider_weight and row['group_points']!=0:
        return round((row['points_possible']/row['group_points'])*row['weight'],2)
    if not consider_weight and total_points != 0:
        return round((row['points_possible']/total_points)*100,2)
    else:return 0


def find_min_week(course_id):
    date = get_course_date_start(course_id)
    year,week,dow=date.isocalendar()
    return week


def find_current_week(row):
    # this needs to be local timezone
    current_date = timezone.localtime(timezone.now())
    year,week,dow = current_date.isocalendar() #dow = day of week
    if row == week:
        return True
    else: return False


def is_weight_considered(course_id):
    url = "select consider_weight from assignment_weight_consideration where course_id=%(course_id)s"
    df = pd.read_sql(url, conn, params={"course_id": course_id})
    value = df['consider_weight'].iloc[0]
    return value


def get_course_date_start(course_id):
    logger.info(get_course_date_start.__name__)
    course_date_start = Course.objects.get(id=course_id).course_date_range.start
    return course_date_start


def are_weighted_assignments_hidden(course_id, df):
    """
    if assignments are weighted then assignment groups weight totals =100% . The code is checking if assignment groups
    has group points corresponding to group weight and if not assignments are hidden
    :param course_id:
    :return:
    """
    logger.info(are_weighted_assignments_hidden.__name__)
    df['weight'] = df['weight'].astype(int)
    tot_weight = df['weight'].sum()
    if tot_weight > 0:
        df['hidden'] = 0
        df = df[df['weight'] > 0]
        df = df.reset_index(drop=True)
        df.loc[0, 'hidden'] = df.loc[0, 'weight']
        for i in range(1, len(df)):
            if df.loc[i, 'group_points']:
                df.loc[i, 'hidden'] = df.loc[i - 1, 'hidden'] + df.loc[i, 'weight']
        if df['hidden'].max() == 100:
            logger.info(f"weighted assignments in course {course_id} are not hidden")
            return False
        else:
            logger.info(f"few weighted assignments in course {course_id} are hidden")
            return True


def find_binning_grade_value(grades):
    fifth_item = grades[4]
    next_to_fifth_item = grades[5]
    if next_to_fifth_item - fifth_item > 2:
        BinningGrade = get_binning_grade()
        return BinningGrade(value=fifth_item, index=4, binning_all=False)
    else:
        return binning_logic(grades, fifth_item)


def is_odd(num):
    if num % 2 == 0:
        return False
    else:
        return True


def show_dashed_line(grade, BinningGrade):
    """
    logic determine to show dashed line or not.
    :param grade:
    :param BinningGrade:
    :return:
    """
    if BinningGrade.binning_all or grade > 96 or grade < 2:
        return False
    else:
        return True


def check_if_grade_qualifies_for_binning(grade, fifthElement):
    # case: 96.7, 94.76,
    if int(grade) - int(fifthElement) > 1:
        return False
    # case: 94.86, 94.76
    if int(grade) - int(fifthElement) == 0:
        return True
    # case 95.89, 94.76
    if is_odd(int(grade)):
        return True


def binning_logic(grades, fifth_item_in_list):
    """
    Histogram binning is by 2 [ [0,2], [2,4], [4,6], …..] each item in the list starting number is inclusive and second
    is exclusive.
    Case 1: Just last 5 are binned
    Actual distribution: [69.79, 80.0, 80.5, 88.21, 88.79, 92.71, 92.71, 92.71, 93.14, 94.43]
    Binning Distribution: [88.79, 88.79, 88.79, 88.79, 88.79, 92.71, 92.71, 92.71, 93.14, 94.43]
    Case 2: More than last 5 are binned based on histogram binning by count of 2
    Actual Distribution: [90.77, 93.09, 93.42, 94.85, 94.87, 94.88, 94.9, 95.55, 95.89, 96.28, 96.4, 96.47, 96.49, 96.68]
    Binning Distribution: [95.89, 95.89, 95.89, 95.89, 95.89, 95.89, 95.89, 95.89, 95.89,96.28, 96.4, 96.47, 96.49, 96.68]

    :param grades: sorted in asc
    :param fifth_item_in_list:
    :return: max grade in the binned list, length of binned grades, bool value indicating whether all grades are being binned
    """
    binning_list = grades[:5]
    BinningGrade = get_binning_grade()
    for grade in grades[5:]:
        if check_if_grade_qualifies_for_binning(grade, fifth_item_in_list):
            binning_list.append(grade)
        else:
            return BinningGrade(max(binning_list), len(binning_list),False)
    return BinningGrade(max(binning_list), len(binning_list), True)


def get_binning_grade():
    return namedtuple('BinningGrade', ['value', 'index','binning_all'])

def df_default_display_settings():
    pd.set_option('display.max_column', None)
    pd.set_option('display.max_rows', None)
    pd.set_option('display.max_seq_items', None)
    pd.set_option('display.max_colwidth', 500)
    pd.set_option('expand_frame_repr', True)


def logout(request):
    logger.info('User %s logging out.' % request.user.username)
    auth.logout(request)
    return redirect(settings.LOGOUT_REDIRECT_URL)


def courses_enabled(request):
    """ Returns json for all courses we currently support and are enabled """
    
    if COURSES_ENABLED:
        data = {}
        for cvo in CourseViewOption.objects.all():
            data.update(cvo.json())

        callback = request.GET.get('callback')
        # Return json
        if callback is None:
            return HttpResponse(json.dumps(data), content_type='application/json')
        # Return json
        else:
            return HttpResponse("{0}({1})".format(callback, json.dumps(data)), content_type='application/json')
    else:
        return HttpResponseForbidden()
