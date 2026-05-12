import api, { setAccessToken } from "./api"
import type { User } from "../types"

export const login = async (
  email: string,
  password: string
): Promise<{ user: User; accessToken: string }> => {
  const { data } = await api.post("/users/login", { email, password })
  const { accessToken, ...user } = data
  setAccessToken(accessToken)
  return { user, accessToken }
}

export const register = async (
  name: string,
  email: string,
  password: string,
  storeName?: string
): Promise<{ user: User; accessToken: string }> => {
  const { data } = await api.post("/users/register", { name, email, password, store: storeName })
  const { accessToken, ...user } = data
  setAccessToken(accessToken)
  return { user, accessToken }
}

export const logout = async (): Promise<void> => {
  await api.post("/users/logout")
  setAccessToken(null)
}

export const getProfile = async (): Promise<User> => {
  const { data } = await api.get("/users/profile")
  return data
}

export const refreshToken = async (): Promise<{ accessToken: string }> => {
  const { data } = await api.post("/users/refresh")
  setAccessToken(data.accessToken)
  return data
}
