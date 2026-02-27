import { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";
import { Brain, Upload, Hash, FileText, Image, Loader2, X } from "lucide-react";

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type AssessmentSetupProps = {
  onGenerate: (text: string, count: number) => void;
  loading: boolean;
};

type FileType = "pdf" | "image" | null;

const AssessmentSetup = ({ onGenerate, loading }: AssessmentSetupProps) => {
  const [extractedText, setExtractedText] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [fileName, setFileName] = useState<string>("");
  const [extracting, setExtracting] = useState<boolean>(false);
  const [fileType, setFileType] = useState<FileType>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const extractFromPDF = async (pdfFile: File) => {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      text += content.items
        .map((s) => ("str" in s ? s.str : "")) // TS safe
        .join(" ") + "\n";
    }

    setExtractedText(text);
    setExtracting(false);
  };

  const extractFromImage = async (imgFile: File) => {
    const result = await Tesseract.recognize(imgFile, "eng");
    setExtractedText(result.data.text);
    setExtracting(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = event.target.files?.[0];
    if (!uploaded) return;

    const isPDF = uploaded.type === "application/pdf";
    const isImage = uploaded.type.startsWith("image");

    if (!isPDF && !isImage) {
      alert("Upload only PDF or Images!");
      return;
    }

    setFileName(uploaded.name);
    setFileType(isPDF ? "pdf" : "image");
    setExtracting(true);
    setExtractedText("");

    if (isPDF) await extractFromPDF(uploaded);
    else await extractFromImage(uploaded);
  };

  const clearFile = () => {
    setFileName("");
    setFileType(null);
    setExtractedText("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extractedText) return;
    onGenerate(extractedText, questionCount);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                bg-cyan-500/10 border border-cyan-500/20 mb-4">
            <Brain className="w-4 h-4 text-cyan-500" />
            <span className="text-sm font-medium text-cyan-500">AI Assessment</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">AI Assessment Generator</span>
          </h1>
          <p className="text-muted-foreground">Upload a PDF or Image to generate MCQ questions</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" /> Upload PDF or Image
            </label>

            {!fileName ? (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-xl bg-secondary/50 hover:bg-secondary hover:border-primary/30 cursor-pointer transition-all">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Click to upload PDF or Image
                </span>
                <span className="text-xs text-muted-foreground/60 mt-1">
                  Supports PDF, PNG, JPG, JPEG
                </span>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary border border-border">
                {fileType === "pdf" ? (
                  <FileText className="w-5 h-5 text-destructive shrink-0" />
                ) : (
                  <Image className="w-5 h-5 text-primary shrink-0" />
                )}

                <span className="text-sm text-foreground truncate flex-1">{fileName}</span>

                {extracting ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                ) : (
                  <button
                    type="button"
                    onClick={clearFile}
                    aria-label="Clear file"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {extracting && (
              <p className="text-xs text-primary flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                {fileType === "pdf"
                  ? "Extracting text from PDF..."
                  : "Running OCR on image..."}
              </p>
            )}
          </div>

          {/* Extracted text preview */}
          {extractedText && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Extracted Text Preview
              </label>
              <div className="max-h-32 overflow-y-auto px-4 py-3 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground leading-relaxed font-mono">
                {extractedText.slice(0, 500)}
                {extractedText.length > 500 && "..."}
              </div>
            </div>
          )}

          {/* Question Count */}
          {extractedText && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" /> Number of Questions
              </label>

              <input
                type="number"
                aria-label="Number of questions"
                min={1}
                max={20}
                required
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            aria-label="Generate Assessment"
            disabled={loading || !extractedText || extracting}
            className="
              w-full py-3.5 rounded-lg font-semibold
              !text-black
              bg-cyan-400 
              hover:bg-cyan-500 active:bg-cyan-800
              disabled:bg-cyan-300 disabled:!text-black disabled:opacity-100 disabled:cursor-not-allowed
              transition-all
            "
          >
          {loading ? (
            <span className="flex items-center justify-center gap-2 !text-black">
              <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
              Generating Questions...
            </span>
          ) : (
            "Generate Assessment"
          )}
        </button>
        </form>
      </div>
    </div>
  );
};

export default AssessmentSetup;