import type { Metadata } from "next";
import { DocumentCentre } from "@/components/easeitr/document-centre";

export const metadata: Metadata = {
  title: "Document Extraction Centre",
  description:
    "Simulate document upload and automated field verification for Form 16, interest certificates, and broker statements.",
};

export default function DocumentsPage() {
  return <DocumentCentre />;
}
