"use client";

import { useRef, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UploadResumeCard({
  action,
  isUploading,
  error,
}: {
  action: (formData: FormData) => void;
  isUploading: boolean;
  error?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (file: File | undefined) => {
    if (!file) {
      setFileName(null);
      setLocalError(undefined);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
      return;
    }

    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
      setLocalError("File too large. Please upload a PDF under 5MB.");
      setFileName(null);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
      return;
    }

    if (file.type !== "application/pdf") {
      setLocalError("Invalid file type. Please upload a PDF.");
      setFileName(null);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
      return;
    }

    setLocalError(undefined);
    setFileName(file.name);

    // To allow re-uploading the same file - only in browser environment
    if (
      fileRef.current &&
      typeof window !== "undefined" &&
      window.DataTransfer
    ) {
      try {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileRef.current.files = dataTransfer.files;
      } catch (e) {
        // Fallback - just clear the input if DataTransfer fails
        // This allows the same file to be selected again
        console.warn("DataTransfer not available, using fallback");
      }
    }
  };

  const onFormSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    if (localError) {
      e.preventDefault();
      return;
    }
    if (!fileRef.current?.files?.[0]) {
      e.preventDefault();
      setLocalError("Please select a file to upload.");
      return;
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your Resume</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          className="space-y-4"
          action={action}
          onSubmit={onFormSubmit}
        >
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            ${
              isDragging
                ? "border-orange-500 bg-orange-50"
                : "border-gray-300 hover:border-gray-400"
            }
            ${isUploading ? "cursor-not-allowed opacity-50" : ""}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileRef.current?.click()}
          >
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your PDF here, or click to select a file.
            </p>
            <p className="text-xs text-gray-500">PDF up to 5MB</p>
            <Input
              id="resume"
              name="resume"
              type="file"
              required
              accept="application/pdf"
              disabled={isUploading}
              ref={fileRef}
              className="hidden"
              aria-label="Drag and drop your PDF here, or click to select a file."
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
          </div>

          {fileName && !localError && (
            <div className="text-sm font-medium text-gray-700">
              Selected file: <span className="font-normal">{fileName}</span>
            </div>
          )}

          {(error || localError) && (
            <p className="text-red-500 text-sm">{localError || error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isUploading || !!localError || !fileName}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Our system is analyzing your resume. This may take a few
                seconds.
              </>
            ) : (
              "Upload and Continue"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
