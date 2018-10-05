# Some utility functions used by other classes in this project

import django

def get_course_name_from_id(course_id):
    """ Returns the course name given the canvas ID
    
    Arguments:
        course_id {int} -- Canvas Course ID
    
    Returns:
        [str] -- Course Name
    """
    course_id = str(django.conf.settings.UDW_ID_PREFIX) + str(course_id)
    course_name = None
    if (course_id):
        with django.db.connection.cursor() as cursor:
            cursor.execute("SELECT name FROM course WHERE id = %s", [course_id])
            row = cursor.fetchone()
            if (row != None):
                course_name = row[0]
    return course_name

def get_default_user_course_id(user_id):
    """ Returns the current Canvas course id 
        First return the ID from the request
        If there is no id in the request try to find the default for the user
        If there is no default return nothing
    Arguments:
        user_id {[int]} -- User Id
    
    Returns:
        [str] -- Canvas Course Id
    """
    course_id = ""
    with django.db.connection.cursor() as cursor:
        cursor.execute("SELECT course_id FROM user WHERE sis_name= %s LIMIT 1", [user_id])
        row = cursor.fetchone()
        if (row != None):
            #Remove the UDW_ID_PREFIX and just return the course_id
            course_id = str(row[0]).replace(str(django.conf.settings.UDW_ID_PREFIX),"")
    return course_id
