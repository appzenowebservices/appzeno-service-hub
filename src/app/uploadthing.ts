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

  // Vendor KYC documents — a signed-in vendor (or admin) uploads Aadhaar / PAN
  // / profile photo here; the URL is saved to VendorProfile by submitKyc.
  vendorKycUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth().catch(() => null);
      const role = ((session?.user as { role?: string } | undefined)?.role ?? "").toUpperCase();
      if (!session?.user || (role !== "VENDOR" && role !== "ADMIN")) {
        throw new UploadThingError("Unauthorized — vendor login required");
      }
      return { userId: (session.user as { id?: string }).id ?? "vendor" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
