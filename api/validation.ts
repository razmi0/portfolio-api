import { ContactFormType } from "./types";

const REGEXP = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  tel: /^\d{10}$/,
};

const hasLength = (str: string) => str.length > 0;
const isValidEmail = (email: string) => hasLength(email) && REGEXP.email.test(email);
const isValidTel = (tel: string) => hasLength(tel) && REGEXP.tel.test(tel);
const userIsReachable = (tel: string, email: string) => isValidEmail(email) || isValidTel(tel);

export const validateContactForm = (data: ContactFormType) => {
  const errors = [
    !isValidEmail(data.email) && "Invalid email",
    !isValidTel(data.tel) && "Invalid tel",
    !hasLength(data.msg) && "Invalid message",
    data.hp && "Invalid HP",
    !userIsReachable(data.tel, data.email) && "At least one valid contact method is required",
  ];
  const hasError = errors.some((e) => e);
  if (hasError) console.log("Invalid form", { email: data.email, message: data.msg, tel: data.tel, hp: data.hp });
  return { errors, hasError };
};
