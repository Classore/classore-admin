// const uploadChunks = async (file: File, moduleId: string) => {
//   const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
//   const chunks: Promise<void>[] = [];

//   const headers = {
//     "Content-Type": "multipart/form-data",
//     Authorization: `Bearer ${Cookies.get("CLASSORE_ADMIN_TOKEN")}`,
//   };

//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), MAX_TIMEOUT);

//   try {
//     for (let start = 0; start < file.size; start += CHUNK_SIZE) {
//       const chunkNumber = Math.floor(start / CHUNK_SIZE);
//       const chunk = file.slice(start, Math.min(start + CHUNK_SIZE, file.size));
//       const chunkBlob = new Blob([chunk], { type: file.type });
//       const formData = new FormData();

//       formData.append("file", chunkBlob);
//       formData.append("chunk_index", (chunkNumber + 1).toString());
//       formData.append("total_chunks", totalChunks.toString());
//       formData.append("upload_id", upload_id);

//       const uploadPromise = axios
//         .put<HttpResponse<UploadResponse>>(
//           `${API_URL}/admin/learning/chunk_uploads/${moduleId}`,
//           formData,
//           {
//             headers,
//             onUploadProgress: (event) => {
//               if (event.total) {
//                 const progress = Math.round(((chunkNumber * CHUNK_SIZE + event.loaded) * 100) / file.size);
//                 setUploadProgress(Math.min(progress, 100));
//               }
//             },
//             signal: controller.signal,
//           }
//         )
//         .then((response) => {
//           if (!response.data.success) {
//             throw new Error(response.data.message || `HTTP error! status: ${response.status}`);
//           }
//           Logger.success(`Chunk ${chunkNumber + 1} of ${totalChunks} uploaded:`, response.data);
//         });

//       chunks.push(uploadPromise);
//       if (chunks.length >= 3) {
//         await Promise.all(chunks);
//         chunks.length = 0;
//       }
//     }
//     if (chunks.length > 0) {
//       await Promise.all(chunks);
//     }
//   } finally {
//     clearTimeout(timeoutId);
//     queryClient.invalidateQueries({ queryKey: ["get-modules", "get-subject"] });
//   }
// };

// const uploadChunk = async (chunkNumber: number, file: File): Promise<void> => {
//   Logger.info("chunk number", chunkNumber);
//   const start = chunkNumber * CHUNK_SIZE;
//   const end = Math.min(start + CHUNK_SIZE, file.size);
//   const chunk = file.slice(start, end);
//   const formData = new FormData();

//   const bytesUploaded = start + chunk.size;
//   const progress = (bytesUploaded / file.size) * 100;

//   const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
//   const chunkBlob = new Blob([chunk], { type: file.type });

//   formData.append("file", chunkBlob);
//   formData.append("chunk_index", chunkNumber.toString());
//   formData.append("total_chunks", totalChunks.toString());
//   formData.append("upload_id", upload_id);

//   Logger.info(`Uploading chunk ${chunkNumber} of ${totalChunks}`, {
//     progress: Math.round(progress * 100) / 100,
//     bytesUploaded,
//     totalBytes: file.size,
//     chunkNumber,
//     totalChunks,
//   });

//   try {
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), MAX_TIMEOUT);
//     const response = await axios.put<HttpResponse<UploadResponse>>(
//       `${API_URL}/admin/learning/chunk_uploads/${moduleId}`,
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${Cookies.get("CLASSORE_ADMIN_TOKEN")}`,
//         },
//         onUploadProgress: (event) => {
//           if (event.total) {
//             const progress = Math.round((event.loaded * 100) / event.total);
//             setUploadProgress(progress);
//           }
//         },
//         signal: controller.signal,
//       }
//     );
//     clearTimeout(timeoutId);

//     if (!response.data.success) {
//       throw new Error(response.data.message || `HTTP error! status: ${response.status}`);
//     }

//     const { data } = response;
//     Logger.success(`Chunk ${chunkNumber} of ${totalChunks} uploaded:`, data);
//   } catch (error) {
//     Logger.error(`Chunk ${chunkNumber} upload failed:`, error);
//     throw error;
//   } finally {
//     queryClient.invalidateQueries({ queryKey: ["get-modules", "get-subject"] });
//   }
// };

// const uploadChunkWithRetry = async (chunkNumber: number, file: File): Promise<void> => {
//   while (retryCount < MAX_RETRIES) {
//     try {
//       return await uploadChunk(chunkNumber, file);
//     } catch (error) {
//       setRetryCount((prev) => prev + 1);
//       if (retryCount === MAX_RETRIES) {
//         throw error;
//       }
//       await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
//     }
//   }
// };

// const uploader = React.useCallback(async (file: File, moduleId: string) => {
//   if (!file || !moduleId) {
//     toast.error("Invalid file or module ID");
//     return;
//   }

//   const token = Cookies.get("CLASSORE_ADMIN_TOKEN");
//   if (!token) {
//     toast.error("Authentication token missing");
//     return;
//   }

//   const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

//   try {
//     setIsLoading(true);
//     setIsUploading(true);
//     abortController.current = new AbortController();
//     for (let chunkNumber = 1; chunkNumber <= totalChunks; chunkNumber++) {
//       if (abortController.current?.signal.aborted) {
//         throw new Error("Upload cancelled");
//       }
//       await uploadChunkWithRetry(chunkNumber, file);
//     }
//     setUploadProgress(100);
//     toast.success("File upload completed");
//   } catch (error) {
//     Logger.error("Upload failed:", error);
//     toast.error(error instanceof Error ? error.message : "Upload failed");
//   } finally {
//     queryClient.invalidateQueries({ queryKey: ["get-modules", "get-subject"] });
//     setIsLoading(false);
//     setIsUploading(false);
//     setUploadProgress(0);
//     setRetryCount(0);
//     abortController.current = null;
//   }
// }, []);
