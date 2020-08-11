/**
 *  Role utility class
 * */

/**
  * Array of string values that are functionally equivalent in representing 'instructor' role
  */
const instructorRoles = [
  'TeacherEnrollment', // student_dashboard.user enrollment_type
  'Instructor' // LTI role
]

/**
 * Return true if isAdmin or enrollmentTypes contains an instructor role
 * @param {boolean} isAdmin
 * @param {Array<string>} enrollmentTypes
 * @return {boolean} Is a teacher or administrator
 */

const isTeacherOrAdmin = (isAdmin, enrollmentTypes) => {
  return isAdmin || instructorRoles.filter(r => enrollmentTypes.includes(r)).length > 0
}

export { isTeacherOrAdmin }
