import { useQuery } from "@tanstack/react-query";

import type { HttpResponse, PaginatedResponse } from "@/types";
import { endpoints } from "@/config";
import { api } from "@/lib";

// ============================================================
// TYPES
// ============================================================

export interface BlogCategoryProps {
    id: string;
    title: string;
    createdOn: string;
    updatedOn: string;
}

export interface BlogProps {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    article_body: string;
    category: BlogCategoryProps | string;
    cover_photo: string;
    reading_time?: string;
    createdOn: string;
    updatedOn: string;
}

export interface CreateBlogCategoryDto {
    title: string;
    createdBy?: string;
}

export interface CreateBlogDto {
    title: string;
    slug: string;
    excerpt: string;
    article_body: string;
    category: string;
    cover_photo: string;
    createdBy?: string;
}

export type UpdateBlogDto = Partial<CreateBlogDto>;
export type UpdateBlogCategoryDto = Partial<CreateBlogCategoryDto>;

// ============================================================
// BLOG CATEGORIES
// ============================================================

const CreateBlogCategory = async (userId: string, payload: CreateBlogCategoryDto) => {
    return api
        .post<HttpResponse<BlogCategoryProps>>(endpoints(userId).blog_categories.create, {
            ...payload,
            createdBy: userId,
        })
        .then((res) => res.data);
};

const GetAllBlogCategories = async (userId: string) => {
    return api
        .get<HttpResponse<PaginatedResponse<BlogCategoryProps>>>(endpoints(userId).blog_categories.all)
        .then((res) => {
            console.log("[Blog Categories] GET response:", JSON.stringify(res.data, null, 2));
            return res.data;
        })
        .catch((err) => {
            console.error("[Blog Categories] GET error:", err?.response?.status, err?.response?.data);
            throw err;
        });
};

const GetBlogCategory = async (categoryId: string, userId: string) => {
    return api
        .get<HttpResponse<BlogCategoryProps>>(endpoints(categoryId).blog_categories.one_with_user(userId))
        .then((res) => res.data);
};

const UpdateBlogCategory = async (categoryId: string, userId: string, payload: UpdateBlogCategoryDto) => {
    return api
        .patch<HttpResponse<BlogCategoryProps>>(endpoints(categoryId).blog_categories.update(userId), payload)
        .then((res) => res.data);
};

const DeleteBlogCategory = async (categoryId: string, userId: string) => {
    return api
        .delete<HttpResponse<BlogCategoryProps>>(endpoints(categoryId).blog_categories.delete(userId))
        .then((res) => res.data);
};

export const useGetAllBlogCategories = (userId: string) => {
    return useQuery({
        queryKey: ["blog-categories", userId],
        queryFn: () => GetAllBlogCategories(userId),
        enabled: !!userId,
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
        select: (data) => data.data,
    });
};

export const useGetBlogCategory = (categoryId: string, userId: string) => {
    return useQuery({
        queryKey: ["blog-category", categoryId, userId],
        queryFn: () => GetBlogCategory(categoryId, userId),
        enabled: !!categoryId && !!userId,
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
        select: (data) => data.data,
    });
};

// ============================================================
// BLOGS / ARTICLES / STUDY GUIDES
// ============================================================

const CreateBlog = async (userId: string, payload: FormData) => {
    return api
        .post<HttpResponse<BlogProps>>(endpoints(userId).blog.create, payload, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => {
            console.log("[Blog] CREATE response:", res.data);
            return res.data;
        })
        .catch((err) => {
            console.error("[Blog] CREATE error:", err?.response?.status, err?.response?.data);
            throw err;
        });
};

const GetAllBlogs = async () => {
    return api
        .get<HttpResponse<PaginatedResponse<BlogProps>>>(endpoints().blog.all)
        .then((res) => {
            console.log("[Blogs] GET response:", JSON.stringify(res.data, null, 2));
            return res.data;
        })
        .catch((err) => {
            console.error("[Blogs] GET error:", err?.response?.status, err?.response?.data);
            throw err;
        });
};

const GetBlog = async (blogId: string) => {
    return api
        .get<HttpResponse<BlogProps>>(endpoints(blogId).blog.one)
        .then((res) => {
            console.log("[Blog] GET one response:", JSON.stringify(res.data, null, 2));
            return res.data;
        })
        .catch((err) => {
            console.error("[Blog] GET one error:", err?.response?.status, err?.response?.data);
            throw err;
        });
};

const UpdateBlog = async (blogId: string, userId: string, payload: FormData) => {
    // PATCH endpoint accepts JSON, not multipart — convert FormData to a plain object.
    // File entries (new cover image picks) are excluded since the route has no upload handler;
    // the existing cover_photo URL string is kept as-is.
    const json: Record<string, string> = {};
    payload.forEach((value, key) => {
        if (typeof value === "string") json[key] = value;
    });
    return api
        .patch<HttpResponse<BlogProps>>(endpoints(blogId).blog.update(userId), json)
        .then((res) => {
            console.log("[Blog] UPDATE response:", res.data);
            return res.data;
        })
        .catch((err) => {
            console.error("[Blog] UPDATE error:", err?.response?.status, err?.response?.data);
            throw err;
        });
};

const DeleteBlog = async (blogId: string, userId: string) => {
    return api
        .delete<HttpResponse<BlogProps>>(endpoints(blogId).blog.delete(userId))
        .then((res) => res.data);
};

export const useGetAllBlogs = () => {
    return useQuery({
        queryKey: ["blogs"],
        queryFn: () => GetAllBlogs(),
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
        select: (data) => data.data,
    });
};

export const useGetBlog = (blogId: string) => {
    return useQuery({
        queryKey: ["blog", blogId],
        queryFn: () => GetBlog(blogId),
        enabled: !!blogId,
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
        select: (data) => data.data,
    });
};

export {
    CreateBlogCategory,
    GetAllBlogCategories,
    GetBlogCategory,
    UpdateBlogCategory,
    DeleteBlogCategory,
    CreateBlog,
    GetAllBlogs,
    GetBlog,
    UpdateBlog,
    DeleteBlog,
};
