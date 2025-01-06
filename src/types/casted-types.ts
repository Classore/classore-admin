import type { Maybe } from ".";

export type CastedUserProps = {
	user_id: string;
	user_createdOn: Date;
	user_updatedOn: Date;
	user_updatedBy: Maybe<string>;
	user_deletedOn: Maybe<Date>;
	user_deletedBy: Maybe<string>;
	user_isDeleted: boolean;
	user_isBlocked: boolean;
	user_first_name: string;
	user_last_name: string;
	user_email: string;
	user_phone_number: Maybe<string>;
	user_description: Maybe<string>;
	user_access_token: string;
	user_referral_code: string;
	user_profile_image: string | undefined;
	user_is_verified: boolean;
	user_chosen_study_plan: boolean;
	user_user_type: "STUDENT" | "PARENT";
	user_wallet_id: string;
	user_sign_up_channel: "DEFAULT";
	user_my_wards: CastedUserProps[];
	user_parent: Maybe<CastedUserProps>;
	user_birthday: Maybe<Date>;
};
