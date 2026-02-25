import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";

export default function AIAssessment() {
  const [_file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);

  const handleFileUpload = async (event) => {
    const uploaded = event.target.files[0];
    setFile(uploaded);

    if (!uploaded) return;

    const isPDF = uploaded.type === "application/pdf";
    const isImage = uploaded.type.startsWith("image");

    setLoading(true);

    if (isPDF) {
      extractFromPDF(uploaded);
    } else if (isImage) {
      extractFromImage(uploaded);
    } else {
      alert("Upload only PDF or Images!");
      setLoading(false);
    }
  };

  // PDF Extract
  const extractFromPDF = async (pdfFile) => {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((s) => s.str).join(" ") + "\n";
    }

    setExtractedText(text);
    setLoading(false);
  };

  // Image OCR
  const extractFromImage = async (imgFile) => {
    const result = await Tesseract.recognize(imgFile, "eng");
    setExtractedText(result.data.text);
    setLoading(false);
  };

  // Generate MCQs using backend
  const generateQuestions = async () => {
    if (!extractedText) return;

    setLoading(true);

    const response = await fetch("http://localhost:5000/api/assessment/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: extractedText,
        count: questionCount,
        type: "MCQ"
      }),
    });

    const data = await response.json();
    setQuestions(data.questions);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Assessment</h1>

      {/* Upload Box */}
      <div className="border p-5 rounded-xl bg-gray-50">
        <p className="font-semibold mb-2">Upload PDF or Image</p>
        <input type="file" onChange={handleFileUpload} />
      </div>

      {loading && <p className="text-blue-600 mt-3">Processing...</p>}

      {extractedText && (
        <div className="mt-6">
          <label className="font-semibold">Number of Questions:</label>
          <input
            type="number"
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value)}
            className="border px-2 py-1 m-2 rounded-lg"
          />

          <button
            onClick={generateQuestions}
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg"
          >
            Generate Assessment
          </button>
        </div>
      )}

      {/* Output */}
      {questions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Generated Questions</h2>
          <ul className="space-y-4">
            {questions.map((q, idx) => (
              <li key={idx} className="bg-white p-4 rounded-lg shadow">
                <p className="font-semibold">{q.question}</p>
                <ul className="ml-5 list-disc">
                  {q.options.map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ul>
                <p className="text-green-600 mt-2">Answer: {q.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}