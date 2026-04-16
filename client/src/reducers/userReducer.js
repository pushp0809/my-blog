import Cookies from 'js-cookie';

export function userReducer(
  state = Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null,
  action
) {
  switch (action.type) {
    case 'LOGIN':
      return action.payload;
    case 'LOGOUT':
      return null;
    case 'UPDATEPICTURE':
      return { ...state, picture: action.payload.picture, bio: action.payload.bio };
    default:
      return state;
  }
}
