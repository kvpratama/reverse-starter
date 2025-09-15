"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    setLocalError(undefined);
    const file = fileRef.current?.files?.[0];
    if (!file) return; // required attribute will catch empty case
    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      e.preventDefault();
      setLocalError("File too large. Please upload a PDF under 10MB.");
      return;
    }
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
          onSubmit={onSubmit}
        >
          <div>
            <Label htmlFor="resume" className="mb-2">
              Resume (PDF)
            </Label>
            <Input
              id="resume"
              name="resume"
              type="file"
              required
              accept="application/pdf"
              disabled={isUploading}
              ref={fileRef}
            />
          </div>
          {(error || localError) && (
            <p className="text-red-500 text-sm">{localError || error}</p>
          )}
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
