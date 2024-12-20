/**
 * Represents a type that can be either T or null
 * @template T - The type that can be nullable
 * @example
 * type MaybeString = Maybe<string>; // string | null
 */
export type Maybe<T> = T | null

/**
 * Represents a type that can be either T or undefined
 * @template T - The type that can be undefined
 * @example
 * type UndefinedNumber = Undefined<number>; // number | undefined
 */
export type Undefined<T> = T | undefined

/**
 * Creates a type that requires all properties of T to match exactly
 * @template T - An object type with string keys
 * @example
 * type ExactPerson = Exact<{ name: string; age: number }>
 */
export type Exact<T extends { [key: string]: unknown }> = {
	[K in keyof T]: T[K]
}

/**
 * Makes specified properties of T optional and nullable
 * @template T - The base type
 * @template K - Keys of T to make optional and nullable
 * @example
 * interface Person { name: string; age: number; }
 * type OptionalAgePerson = MakeOptional<Person, 'age'>;
 * // { name: string; age?: number | null; }
 */
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]?: Maybe<T[SubKey]>
}

/**
 * Makes specified properties of T nullable while keeping them required
 * @template T - The base type
 * @template K - Keys of T to make nullable
 * @example
 * interface Person { name: string; age: number; }
 * type NullableAgePerson = MakeMaybe<Person, 'age'>;
 * // { name: string; age: number | null; }
 */
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]: Maybe<T[SubKey]>
}

/**
 * Gets a union type of all the values in T
 * @template T - The object type to extract values from
 * @example
 * const colors = { red: 'RED', blue: 'BLUE' } as const;
 * type Colors = ValueOf<typeof colors>; // 'RED' | 'BLUE'
 */
export type ValueOf<T> = T[keyof T]

/**
 * Creates a type for an array that must contain at least one element
 * @template T - The type of elements in the array
 * @example
 * const numbers: NonEmptyArray<number> = [1]; // valid
 * const empty: NonEmptyArray<number> = []; // invalid
 */
export type NonEmptyArray<T> = [T, ...T[]]

/**
 * Ensures an array type includes all possible values of type T
 * @template T - The type that must be included
 * @template U - Array type that should include T
 * @example
 * type Status = 'active' | 'inactive';
 * type ValidStatuses = MustInclude<Status, ['active', 'inactive']>;
 */
export type MustInclude<T, U extends T[]> = [T] extends [ValueOf<U>] ? U : never

export interface HttpResponse<T> {
	error: string
	data: T
	message: string
	success: boolean
}

export type HttpError = {
	response: {
		data: {
			error: string
			errorCode: string
			message: string
			status: string
			success: boolean
		}
	}
}

export interface PaginatedResponse<T> {
	data: T[]
	meta: {
		itemCount: number
		hasPreviousPage: boolean
		hasNextPage: boolean
		page: number
		pageCount: number
		take: number
	}
}

export type PaginationProps = {
	limit?: number
	page?: number
}

export type QueryParamsProps = {
	[key: string]: string | number | boolean | undefined | null
}

export type Node = {
	__typename?: "Node"
	id: string
	createdOn: Date | string
	deletedBy?: Maybe<string>
	deletedOn?: Maybe<Date | string>
	isDeleted?: boolean
	updatedBy?: Maybe<string>
	updatedOn?: Maybe<Date | string>
}

export type PaginatedRoleProps = {
	role_id: string
	role_createdOn: Date | string
	role_deletedBy?: Maybe<string>
	role_deletedOn?: Maybe<Date | string>
	role_isDeleted?: boolean
	role_updatedBy?: Maybe<string>
	role_updatedOn?: Maybe<Date | string>
	role_isBlocked: boolean
	role_name: string
	role_admin_read: "NO" | "YES"
	role_admin_write: "NO" | "YES"
	role_student_read: "NO" | "YES"
	role_student_write: "NO" | "YES"
	role_transactions_read: "NO" | "YES"
	role_transactions_write: "NO" | "YES"
	role_tutor_read: "NO" | "YES"
	role_tutor_write: "NO" | "YES"
	role_videos_read: "NO" | "YES"
	role_videos_write: "NO" | "YES"
	role_waitlist_read: "NO" | "YES"
	role_waitlist_write: "NO" | "YES"
}

export type RoleProps = {
	id: string
	createdOn: Date | string
	deletedBy?: Maybe<string>
	deletedOn?: Maybe<Date | string>
	isDeleted?: boolean
	updatedBy?: Maybe<string>
	updatedOn?: Maybe<Date | string>
	isBlocked: boolean
	name: string
	admin_read: "NO" | "YES"
	admin_write: "NO" | "YES"
	student_read: "NO" | "YES"
	student_write: "NO" | "YES"
	transactions_read: "NO" | "YES"
	transactions_write: "NO" | "YES"
	tutor_read: "NO" | "YES"
	tutor_write: "NO" | "YES"
	videos_read: "NO" | "YES"
	videos_write: "NO" | "YES"
	waitlist_read: "NO" | "YES"
	waitlist_write: "NO" | "YES"
}

export type AdminProps = Node & {
	__typename?: "User"
	access_token: string
	email: string
	first_name: string
	last_name: string
	phone_number: string
	role: RoleProps
}

export type UserProps = Node & {
	__typename?: "User"

	email: string
	first_name: string
	last_name: string
	phone_number: string
}

export type CourseProps = Node & {}

export type WaitlistUserProps = {
	waitlists_createdOn: Date | string
	waitlists_deletedBy: Maybe<string>
	waitlists_deletedOn?: Date | string
	waitlists_email: string
	waitlists_first_name: string
	waitlists_id: string
	waitlists_isDeleted?: boolean
	waitlists_last_name: string
	waitlists_phone_number: string
	waitlists_updateBy: Maybe<string>
	waitlists_updateOn?: Date | string
	waitlists_waitlist_type: string
}
