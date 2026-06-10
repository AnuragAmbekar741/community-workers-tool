export type Role = "worker" | "supervisor" | "admin";

export type UserDto = {
  systemId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  organisation: string | null;
  role: Role;
  createdAt: string;
};
