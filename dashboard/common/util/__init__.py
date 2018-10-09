# Some utility functions used by other classes in this project

import django

def get_course_name_from_id(course_id):
    """[Get the long course name from the id]
    
    :param course_id: [Canvas course ID without UDW PREFIX]
    :type course_id: [str]
    :return: [Course Name of course or blank not found]
    :rtype: [str]
    """

    course_id = str(django.conf.settings.UDW_ID_PREFIX) + str(course_id)
    course_name = ""
    if (course_id):
        with django.db.connection.cursor() as cursor:
            cursor.execute("SELECT name FROM course WHERE id = %s", [course_id])
            row = cursor.fetchone()
            if (row != None):
                course_name = row[0]
    return course_name

def get_default_user_course_id(user_id):
    """[Get the default course id for the user id from the user table]
    :param user_id: [SIS User ID of the user]
    :type user_id: [str]
    :return: [Canvas Course ID]
    :rtype: [str]
    """
    course_id = ""
    with django.db.connection.cursor() as cursor:
        cursor.execute("SELECT course_id FROM user WHERE sis_name= %s ORDER BY course_id DESC LIMIT 1", [user_id])
        row = cursor.fetchone()
        if (row != None):
            #Remove the UDW_ID_PREFIX and just return the course_id
            course_id = str(row[0]).replace(str(django.conf.settings.UDW_ID_PREFIX),"")
    return course_id


