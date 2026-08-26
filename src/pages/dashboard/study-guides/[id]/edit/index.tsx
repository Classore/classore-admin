import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronLeft } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout";
import { Seo } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { ImageUploader } from "@/components/image-uploader";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { queryClient } from "@/providers";
import { useUserStore } from "@/store/z-store";
import { GetBlog, GetAllBlogCategories, UpdateBlog } from "@/queries/blog";
import type { BlogCategoryProps } from "@/queries/blog";

export default function EditStudyGuidePage() {
    const router = useRouter();
    const { id } = router.query as { id: string };
    const { user } = useUserStore();
    const userId = user?.id ?? "";

    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState<File | string | null>(null);
    const [category, setCategory] = useState("");
    const [readMinutes, setReadMinutes] = useState<string>("5");
    const [localCategories, setLocalCategories] = useState<{ id: string; title: string }[]>([]);

    // Fetch the article
    const { data: blogData, isLoading } = useQuery({
        queryKey: ["blog", id],
        queryFn: () => GetBlog(id),
        enabled: !!id,
        retry: false,
    });

    const blog = blogData?.data;

    // Fetch categories
    const { data: categoriesData } = useQuery({
        queryKey: ["blog-categories", userId],
        queryFn: () => GetAllBlogCategories(userId),
        enabled: !!userId,
        retry: false,
    });

    // Normalize both paginated and direct-array category responses
    useEffect(() => {
        const raw = categoriesData?.data;
        if (!raw) return;
        const arr: { id: string; title: string }[] = Array.isArray(raw)
            ? (raw as BlogCategoryProps[])
            : Array.isArray((raw as { data?: BlogCategoryProps[] }).data)
                ? (raw as { data: BlogCategoryProps[] }).data
                : [];
        setLocalCategories(arr);
    }, [categoriesData]);

    // Pre-fill controlled state from fetched blog data
    useEffect(() => {
        if (!blog) return;
        setContent(blog.article_body ?? "");

        // Only use cover_photo if it's a real remote URL (not a legacy blob: URL)
        const photoUrl = blog.cover_photo ?? "";
        if (photoUrl.startsWith("http")) {
            setCoverImage(photoUrl);
        }

        // Extract category ID whether backend returns object or plain string
        const catId = typeof blog.category === "string" ? blog.category : blog.category?.id;
        setCategory(catId ?? "");

        if (blog.reading_time) setReadMinutes(String(blog.reading_time));
    }, [blog]);

    const { isPending, mutate: updateBlog } = useMutation({
        mutationFn: (payload: FormData) => UpdateBlog(id, userId, payload),
        mutationKey: ["update-blog", id],
        onSuccess: (data) => {
            toast.success(data.message ?? "Article updated successfully!");
            // Patch the blogs list cache so index page reflects changes immediately
            if (data.data) {
                queryClient.setQueryData(
                    ["blogs"],
                    (old: { data: unknown[] } | undefined) => {
                        const existing = Array.isArray(old?.data) ? old.data : [];
                        return {
                            ...old,
                            data: existing.map((b) =>
                                (b as { id: string }).id === id ? data.data : b
                            ),
                        };
                    }
                );
            }
            queryClient.invalidateQueries({ queryKey: ["blogs"] });
            queryClient.invalidateQueries({ queryKey: ["blog", id] });
            router.push("/dashboard/study-guides");
        },
        onError: (error: { response?: { data?: { message?: string | string[] } } }) => {
            const msg = error?.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg.join(", ") : (msg ?? "Failed to update article"));
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const rawFd = new FormData(form);

        const title = (rawFd.get("title") as string) ?? "";
        const excerpt = (rawFd.get("excerpt") as string) ?? "";

        if (!title.trim()) return toast.error("Title is required");
        if (!category) return toast.error("Please select a category");

        const slug = title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");

        const payload = new FormData();
        payload.append("title", title);
        payload.append("slug", slug);
        payload.append("excerpt", excerpt);
        payload.append("article_body", content);
        payload.append("category", category);
        payload.append("createdBy", userId);
        payload.append("reading_time", readMinutes);
        payload.append("status", "PUBLISHED");

        if (coverImage instanceof File) {
            payload.append("cover_photo", coverImage, coverImage.name);
        } else if (typeof coverImage === "string" && coverImage) {
            payload.append("cover_photo", coverImage);
        }

        updateBlog(payload);
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-full items-center justify-center text-neutral-500">
                    Loading article...
                </div>
            </DashboardLayout>
        );
    }

    return (
        <>
            <Seo title="Edit Study Guide" />
            <DashboardLayout>
                <form
                    onSubmit={handleSubmit}
                    className="flex w-full flex-col gap-8 mx-auto max-w-4xl pb-10">
                    {/* Header */}
                    <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard/study-guides">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="border border-neutral-200">
                                    <ChevronLeft className="size-4" />
                                </Button>
                            </Link>
                            <h1 className="text-xl font-bold text-neutral-900 md:text-2xl">
                                Edit Study Guide
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href="/dashboard/study-guides">
                                <Button type="button" variant="outline">Discard</Button>
                            </Link>
                            <Button type="submit" variant="default" disabled={isPending || isLoading}>
                                {isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Left Column */}
                        <div className="flex flex-col gap-6 md:col-span-2">
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-neutral-900 mb-5">
                                    Content &amp; Media
                                </h2>

                                <div className="flex flex-col gap-5">
                                    <Input
                                        required
                                        name="title"
                                        label="Article Title"
                                        defaultValue={blog?.title}
                                        key={`title-${blog?.id}`}
                                        placeholder="e.g. How to Create an Effective Study Schedule"
                                    />

                                    <Textarea
                                        required
                                        name="excerpt"
                                        label="Excerpt"
                                        defaultValue={blog?.excerpt}
                                        key={`excerpt-${blog?.id}`}
                                        placeholder="A short summary of the article..."
                                        rows={3}
                                    />

                                    <div className="flex flex-col gap-1.5 font-body">
                                        <label className="text-xs text-neutral-400">Article Body</label>
                                        <TiptapEditor
                                            value={content}
                                            initialValue={blog?.article_body}
                                            onChange={setContent}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-6 md:col-span-1">
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm flex flex-col gap-5">
                                <h2 className="text-lg font-semibold text-neutral-900">
                                    Publish Settings
                                </h2>

                                <div className="flex flex-col gap-1.5 font-body">
                                    <label className="text-xs text-neutral-400">Category</label>
                                    {blog && localCategories.length > 0 ? (
                                        <Select
                                            key={`cat-${blog.id}`}
                                            defaultValue={category}
                                            onValueChange={setCategory}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {localCategories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        {cat.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="flex h-10 items-center rounded-md border border-neutral-200 px-3 text-sm text-neutral-400">
                                            {isLoading ? "Loading..." : "Loading categories..."}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Input
                                        required
                                        type="number"
                                        min="1"
                                        label="Reading Time"
                                        value={readMinutes}
                                        onChange={(e) => setReadMinutes(e.target.value)}
                                        placeholder="e.g. 5"
                                        wrapperClassName="flex-1"
                                    />
                                    <span className="text-sm text-neutral-500 mt-6 shrink-0">
                                        min read
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1.5 font-body">
                                    <label className="text-xs text-neutral-400 dark:text-neutral-50 mb-1.5">
                                        Cover Image
                                    </label>
                                    <ImageUploader
                                        fileType="image"
                                        value={coverImage}
                                        onValueChange={setCoverImage}
                                    />
                                    <p className="text-xs text-neutral-400 mt-1">
                                        Provide a high-quality cover image.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </DashboardLayout>
        </>
    );
}
