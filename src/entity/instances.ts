import { InstanceStatus } from "./sea_orm_active_enums";

export type Instances = {
  id: string;
  status: InstanceStatus;
  flag: string;
  content?: string;
  challenge_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  destroy_at: string;
  identifier: string;
};
