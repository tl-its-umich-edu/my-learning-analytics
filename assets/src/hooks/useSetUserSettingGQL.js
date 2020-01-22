import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import debounce from 'lodash.debounce'

const UPDATE_USER_SETTING = gql`
  mutation setUserDefaultSelection($input: UserDefaultSelectionInput!) {
    setUserDefaultSelection(data: $input) {
      userDefaultSelection {
        courseId,
        defaultViewType,
        defaultViewValue,
      }
    }
  }
`

const useSetUserSettingGQL = () => {
  const [
    updateUserSetting,
    { loading: mutationLoading, error: mutationError }
  ] = useMutation(UPDATE_USER_SETTING)

  const saveUserSetting = debounce(updateUserSetting, 500, {
    leading: false,
    trailing: true
  })

  return { saveUserSetting, mutationLoading, mutationError }
}

export default useSetUserSettingGQL
