import { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

type Status = "idle" | "uploading" | "saving" | "done" | "error";

export default function ApplicationForm() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Simple client-side validation
    if (!file) {
      setError("Please attach your resume.");
      return;
    }
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      setError("Only PDF, DOC, or DOCX files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      return;
    }

    try {
      setStatus("uploading");
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const key = `${Date.now()}_${crypto.randomUUID()}_${safeName}`;
      const storageRef = ref(storage, `resumes/${key}`);
      const task = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
      });

      await new Promise<void>((resolve, reject) => {
        task.on(
          "state_changed",
          (snap) => {
            const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
            setProgress(pct);
          },
          reject,
          () => resolve()
        );
      });

      const resumeUrl = await getDownloadURL(storageRef);

      setStatus("saving");
      await addDoc(collection(db, "applications"), {
        name: form.name,
        email: form.email.toLowerCase(),
        resumeUrl,
        resumeFileName: file.name,
        resumeContentType: file.type,
        resumeSize: file.size,
        createdAt: serverTimestamp(),
      });

      setStatus("done");
      setForm({ name: "", email: "" });
      setFile(null);
      setProgress(0);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setError(err?.message ?? "Something went wrong.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-3">
      <input
        className="border p-2 w-full"
        placeholder="Full name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        maxLength={100}
      />
      <input
        type="email"
        className="border p-2 w-full"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
        maxLength={160}
      />
      <input
        type="file"
        className="border p-2 w-full"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        required
      />

      {status === "uploading" && (
        <div className="text-sm">Uploading… {progress}%</div>
      )}

      <button
        className="border p-2"
        type="submit"
        disabled={status === "uploading" || status === "saving"}
      >
        {status === "uploading"
          ? "Uploading…"
          : status === "saving"
          ? "Saving…"
          : "Submit application"}
      </button>

      {status === "done" && <p className="text-green-700">Thanks! We received your application.</p>}
      {status === "error" && <p className="text-red-700">{error}</p>}
    </form>
  );
}
