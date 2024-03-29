import { gql, useMutation } from '@apollo/client'

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
    saveUserSetting,
    { loading: mutationLoading, error: mutationError }
  ] = useMutation(UPDATE_USER_SETTING)

  return { saveUserSetting, mutationLoading, mutationError }
}

export default useSetUserSettingGQL
