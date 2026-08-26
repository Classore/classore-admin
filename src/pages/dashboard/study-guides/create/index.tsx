import React, { useState } from "react";
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
import {
    CreateBlog,
    GetAllBlogCategories,
} from "@/queries/blog";

export default function CreateStudyGuidePage() {
    const router = useRouter();
    const { user } = useUserStore();
    const userId = user?.id ?? "";

    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState<File | string | null>(null);
    const [category, setCategory] = useState("");
    const [readMinutes, setReadMinutes] = useState<string>("5");

    const [localCategories, setLocalCategories] = useState<{ id: string; title: string }[]>([]);

    const { data: categoriesData } = useQuery({
        queryKey: ["blog-categories", userId],
        queryFn: () => GetAllBlogCategories(userId),
        enabled: !!userId,
        retry: false,
    });

    // Normalize both paginated and direct-array responses
    React.useEffect(() => {
        const raw = categoriesData?.data;
        if (!raw) return;
        const arr = Array.isArray(raw)
            ? raw
            : Array.isArray((raw as { data?: unknown[] }).data)
              ? (raw as { data: { id: string; title: string }[] }).data
              : [];
        setLocalCategories(arr);
    }, [categoriesData]);

    const { isPending, mutate: createBlog } = useMutation({
        mutationFn: (payload: FormData) => CreateBlog(userId, payload),
        mutationKey: ["create-blog"],
        onSuccess: (data) => {
            toast.success(data.message ?? "Article published successfully!");
            // Inject the new blog directly into the cache so the index page
            // renders it immediately without waiting for a background refetch
            if (data.data) {
                queryClient.setQueryData(
                    ["blogs"],
                    (old: { data: unknown[] } | undefined) => {
                        const existing = Array.isArray(old?.data) ? old.data : [];
                        return { ...old, data: [data.data, ...existing] };
                    }
                );
            }
            queryClient.invalidateQueries({ queryKey: ["blogs"] });
            router.push("/dashboard/study-guides");
        },
        onError: (error: { response?: { data?: { message?: string | string[] } } }) => {
            const msg = error?.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg.join(", ") : (msg ?? "Failed to publish article"));
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
        if (!content.trim()) return toast.error("Article body is required");

        // Build slug from title
        const slug = title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");

        // Build a fresh FormData to send — append each field explicitly
        const payload = new FormData();
        payload.append("title", title);
        payload.append("slug", slug);
        payload.append("excerpt", excerpt);
        payload.append("article_body", content);
        payload.append("category", category);
        payload.append("createdBy", userId);
        payload.append("reading_time", readMinutes);
        payload.append("status", "PUBLISHED");

        // Attach the real File so the server can store it; fall back to URL string
        if (coverImage instanceof File) {
            payload.append("cover_photo", coverImage, coverImage.name);
        } else if (typeof coverImage === "string" && coverImage) {
            payload.append("cover_photo", coverImage);
        }

        createBlog(payload);
    };

    return (
        <>
            <Seo title="Create Study Guide" />
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
                                Create Study Guide
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href="/dashboard/study-guides">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                            <Button type="submit" variant="default" disabled={isPending}>
                                {isPending ? "Publishing..." : "Publish Article"}
                            </Button>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Left Column */}
                        <div className="flex flex-col gap-6 md:col-span-2">
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-neutral-900 mb-5">
                                    Content & Media
                                </h2>

                                <div className="flex flex-col gap-5">
                                    <Input
                                        required
                                        name="title"
                                        label="Article Title"
                                        placeholder="e.g. How to Create an Effective Study Schedule"
                                    />

                                    <Textarea
                                        required
                                        name="excerpt"
                                        label="Excerpt"
                                        placeholder="A short summary of the article..."
                                        rows={3}
                                    />

                                    <div className="flex flex-col gap-1.5 font-body">
                                        <label className="text-xs text-neutral-400">Article Body</label>
                                        <TiptapEditor value={content} onChange={setContent} />
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
                                    <Select required value={category} onValueChange={setCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {localCategories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.title}
                                                </SelectItem>
                                            ))}
                                            {localCategories.length === 0 && (
                                                <SelectItem value="__none__" disabled>
                                                    No categories yet
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
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
