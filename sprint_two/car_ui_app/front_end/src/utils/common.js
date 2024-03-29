import axios from 'axios';
import jwt_decode from 'jwt-decode';
import store from '../store/store';
import { initiateGetProfile } from '../actions/profile';
import { signIn } from '../actions/auth';
import { history } from '../router/appRouter';

//Returns a bool
export const validateFields = (fieldsToValidate) => {
  return fieldsToValidate.every((field) => Object.values(field)[0] !== '');
};

export const maintainSession = () => {
  const user_token = localStorage.getItem('user_token');
  if (user_token) 
  {
    const currentPath = window.location.pathname;
    if (currentPath === '/' || currentPath === '/register') 
    {
      history.push('/profile');
    }
    const decoded = jwt_decode(user_token);
    updateStore(decoded);
  } 
  else 
  {
    history.push('/');
  }
};

export const updateStore = (user) => {
  const {profile_id, profile_name} = user;
  store.dispatch(signIn({profile_id, profile_name, token: localStorage.getItem('user_token')}));
  store.dispatch(initiateGetProfile(profile_name));
};

export const setAuthHeader = () => {
  const token = localStorage.getItem('user_token');
  if (token) 
  {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

export const removeAuthHeader = () => {
  delete axios.defaults.headers.common['Authorization'];
};