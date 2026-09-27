import type { Metadata } from "next";
import { DocumentCentre } from "@/components/easeitr/document-centre";

export const metadata: Metadata = {
  title: "Document Extraction Centre",
  description:
    "Read a Form 16, AIS, Form 26AS, broker statement, or bill after you sign in. You can choose the type, or let EaseITR choose it.",
};

export default function DocumentsPage() {
  return <DocumentCentre />;
}
