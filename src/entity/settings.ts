import type { SettingValueType } from "./sea_orm_active_enums";

export type Settings = {
	id: string;
	key: string;
	type: SettingValueType;
	value: string;
	description: string;
	protected: boolean;
	updated_at: string;
};
