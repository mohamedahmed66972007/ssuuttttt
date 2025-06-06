import React, { useState } from "react";
import { useFiles } from "@/hooks/useFiles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { X, Upload } from "lucide-react";
import { subjectOptions, semesterOptions } from "./SubjectIcons";
import { cloudinaryStorageService } from "@/lib/storage";
import { FileData } from "@shared/schema";

interface AddFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUploaded?: () => void;
}

const AddFileModal: React.FC<AddFileModalProps> = ({ isOpen, onClose, onFileUploaded }) => {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !title.trim() || !subject || !semester) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول واختيار ملف",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Use Cloudinary Storage service directly

      const newFile = await cloudinaryStorageService.uploadFile(file, title, subject, semester);

      toast({
        title: "نجح الرفع",
        description: "تم رفع الملف بنجاح",
      });

      // Reset form
      setTitle("");
      setSubject("");
      setSemester("");
      setFile(null);
      if (onFileUploaded) {
        onFileUploaded();
      }
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "خطأ في الرفع",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء رفع الملف. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-right">إضافة ملف جديد</DialogTitle>
          <DialogDescription className="text-right">
            قم برفع ملف جديد إلى المكتبة
          </DialogDescription>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute left-2 top-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">المادة</Label>
              <Select value={subject} onValueChange={setSubject} required>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="اختر المادة" />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">الفصل الدراسي</Label>
              <Select value={semester} onValueChange={setSemester} required>
                <SelectTrigger id="semester">
                  <SelectValue placeholder="اختر الفصل" />
                </SelectTrigger>
                <SelectContent>
                  {semesterOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">عنوان الملف</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>الملف</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer ${
                isDragging ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-600"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileUpload")?.click()}
            >
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                اسحب الملف هنا أو اضغط للاختيار
              </p>
              {file && (
                <div className="mt-2 bg-primary/10 px-3 py-1 rounded-full text-primary text-sm">
                  {file.name}
                </div>
              )}
              <input
                type="file"
                className="hidden"
                id="fileUpload"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <span className="animate-spin ml-2">◌</span>
                  جاري الرفع...
                </>
              ) : (
                "إضافة الملف"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFileModal;