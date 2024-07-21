import type { ResultSet } from "@libsql/client/.";
import type { ContactFormType, ErrorLoginFormType, ErrorsContactFormType, LoginFormType, UserAgentInfo } from "./types";

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

  const errors: ErrorsContactFormType = {
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

type LoginErrorType = {
  errors: ErrorLoginFormType;
  hasError: boolean;
};
export const validateLoginForm = (data: LoginFormType): LoginErrorType => {
  const newErrors: ErrorLoginFormType = {
    username: !data.username && "Nom d'utilisateur requis",
    password: !data.password && "Mot de passe requis",
  };

  const hpError = data.hp && "Invalid HP";

  return (!newErrors.username && !newErrors.password) || hpError
    ? { hasError: false, errors: newErrors }
    : { hasError: true, errors: newErrors };
};

export const isInvalidUser = (user: ResultSet): LoginErrorType => {
  const withError = {
    errors: { username: "Invalid username or password", password: "Invalid username or password" },
    hasError: true,
  };
  const woError = { errors: { username: false, password: false }, hasError: false } as LoginErrorType;
  return user.rows[0].success === 0 ? withError : woError;
};

// if(user.rows[0].success === 0) return c.json({res, errors: {username: "Invalid username or password", password: "Invalid username or password"}});
