import { ContactFormType } from "./types";

type ErrorsType = {
  email: boolean | string;
  tel: boolean | string;
  msg: boolean | string;
  reachable: boolean | string;
};

const errorsInit = {
  email: false,
  tel: false,
  msg: false,
  reachable: false,
};

const REGEXP = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  tel: /^\d{10}$/,
};

const hasLength = (str: string) => str.length > 0;
const isValidEmail = (email: string) => hasLength(email) && REGEXP.email.test(email);
const isValidTel = (tel: string) => hasLength(tel) && REGEXP.tel.test(tel);

export const validateContactForm = (data: ContactFormType) => {
  let reachabilityError = false;
  let emailError = !isValidEmail(data.email);
  let telError = !isValidTel(data.tel);
  if (emailError && telError) reachabilityError = true;

  const errors: ErrorsType = {
    email: emailError && "Email invalide",
    tel: telError && "Téléphone invalide",
    msg: !hasLength(data.msg) && "Message requis",
    reachable: reachabilityError && "Au moins un moyen de contact valide est requis",
  };

  if (typeof errors.reachable === "boolean") {
    errors.email = false;
    errors.tel = false;
  }

  const formatedErrors = [errors.email, errors.tel, errors.msg, errors.reachable, data.hp && "Invalid HP"];

  if (Object.values(errors).some((err) => typeof err === "string")) {
    console.log("Invalid form", { email: data.email, message: data.msg, tel: data.tel, hp: data.hp });
    return { errors: formatedErrors, hasError: true };
  }

  return { errors: formatedErrors, hasError: false };
};
