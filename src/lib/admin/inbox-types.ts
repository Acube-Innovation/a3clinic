/** Shared types for the operational inboxes (client-safe: types only). */

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type AppointmentRequest = {
  id: string;
  createdAt: string;
  status: AppointmentStatus;
  mode: "online" | "clinic";
  concern: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  notes: string;
  /** Filenames only in this demo — see README on private report storage. */
  files: string[];
};

export type Enquiry = {
  id: string;
  createdAt: string;
  read: boolean;
  name: string;
  phone: string;
  email: string;
  reason: string;
  message: string;
};
