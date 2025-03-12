// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation - must be at least 8 characters and include a letter and a number
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
};

// Name validation - not empty and only letters, spaces, hyphens, and apostrophes
export const isValidName = (name: string): boolean => {
  return name.trim().length > 0 && /^[A-Za-z\s'-]+$/.test(name);
};

// Family Circle name validation - not empty
export const isValidFamilyCircleName = (name: string): boolean => {
  return name.trim().length > 0;
};

// Invite code validation - alphanumeric, 6-10 characters
export const isValidInviteCode = (code: string): boolean => {
  return /^[A-Za-z0-9]{6,10}$/.test(code);
};

// Get error message for email validation
export const getEmailError = (email: string): string | null => {
  if (!email.trim()) {
    return "Email is required";
  }
  if (!isValidEmail(email)) {
    return "Please enter a valid email address";
  }
  return null;
};

// Get error message for password validation
export const getPasswordError = (password: string): string | null => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/[A-Za-z]/.test(password)) {
    return "Password must include at least one letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number";
  }
  return null;
};

// Get error message for name validation
export const getNameError = (name: string, fieldName: string = 'Name'): string | null => {
  if (!name.trim()) {
    return `${fieldName} is required`;
  }
  if (!/^[A-Za-z\s'-]+$/.test(name)) {
    return `${fieldName} can only contain letters, spaces, hyphens and apostrophes`;
  }
  return null;
};

// Get error message for Family Circle name validation
export const getFamilyCircleNameError = (name: string): string | null => {
  if (!name.trim()) {
    return "Family Circle name is required";
  }
  return null;
};

// Get error message for invite code validation
export const getInviteCodeError = (code: string): string | null => {
  if (!code.trim()) {
    return "Invite code is required";
  }
  if (!/^[A-Za-z0-9]{6,10}$/.test(code)) {
    return "Invite code must be 6-10 alphanumeric characters";
  }
  return null;
}; 