export const APPLICATION_STATUSES = [
  "Applied",
  "Interview",
  "Selected",
  "Rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type ApplicationRecord = {
  _id: string;
  company: string;
  role: string;
  location: string;
  url: string;
  status: ApplicationStatus;
  resume: string;
  appliedAt: string;
  referral: {
    email: string;
    referred: boolean;
  };
};
