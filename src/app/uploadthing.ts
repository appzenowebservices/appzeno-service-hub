import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "~/server/auth";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth().catch(() => null);
      const role = ((session?.user as { role?: string } | undefined)?.role ?? "").toUpperCase();
      if (!session?.user || role !== "ADMIN") {
        throw new UploadThingError("Unauthorized — admin only");
      }
      const id = (session.user as { id?: string }).id ?? "admin";
      return { userId: id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
