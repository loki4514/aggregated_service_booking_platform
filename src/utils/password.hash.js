import bcrypt from "bcrypt"
import { SALT_ROUNDS } from "../config/constants.js"

export async function hashSecret(plainText) {
  return bcrypt.hash(plainText, parseInt(SALT_ROUNDS))
}

export async function compareSecret(plainText, hash) {
  return bcrypt.compare(plainText, hash)
}
