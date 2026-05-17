import type { EmailConfig } from "@convex-dev/auth/server";

function generateResetToken() {
  const alphabet = "0123456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export const PasswordResetToken: EmailConfig = {
  id: "password-reset-token",
  type: "email",
  name: "Password reset token",
  maxAge: 60 * 15,
  generateVerificationToken: async () => generateResetToken(),
  async sendVerificationRequest({ identifier, token }) {
    console.info(
      `Bodgeham Mysteries password reset token for ${identifier}: ${token}`,
    );
  },
};
