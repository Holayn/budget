import { API_URL } from './globals';

export async function get(url, options) {
  return (await (fetch(`${API_URL}${url}`, options))).json();
}

export async function post(url, options) {
  return (await (fetch(`${API_URL}${url}`, {
    method: 'POST',
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  }))).json();
}