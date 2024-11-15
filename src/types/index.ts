export type Maybe<T> = T | null

export type Undefined<T> = T | undefined

export type Exact<T extends { [key: string]: unknown }> = {
	[K in keyof T]: T[K]
}

export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]?: Maybe<T[SubKey]>
}

export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]: Maybe<T[SubKey]>
}

export type ValueOf<T> = T[keyof T]

export type NonEmptyArray<T> = [T, ...T[]]

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

export type AdminProps = Node & {
	__typename?: "User"
	email: string
	firstName: string
	lastName: string
	password: string
	role: "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "SUB_TEACHER"
	username: string
}

export type UserProps = Node & {
	__typename?: "User"
	email: string
	firstName: string
	lastName: string
	password: string
	role: "STUDENT" | "PARENT"
	username: string
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
