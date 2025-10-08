export class MailConfig {
  to: string;
  name: string;
  subject: string;
  template: string;
}

export class MemberDetail extends MailConfig {
  email: string;
  password: string;
}


export class PasswordReset extends MailConfig {
  resetLink: string;
}

export class GeneralInformation extends MailConfig {
  message: string;
}

export class RequestReview extends MailConfig {
  requestType: string;
}

export class EmailVerification extends MailConfig {
  verificationLink: string;
}

export class AssessmentInvitation extends MailConfig {
  candidateName: string;
  candidateEmail: string;
  companyName: string;
  invitationLink: string;
  assessmentTitles: string[];
  deadline?: string;
  maxAttempts: number;
  customMessage?: string;
}
