import { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import './Join.css';

type Status = "idle" | "uploading" | "saving" | "done" | "error";

export default function Join() {
	const [form, setForm] = useState({ name: "", email: "", location: "" });
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
					location: form.location,
					resumeUrl,
					resumeFileName: file.name,
					resumeContentType: file.type,
					resumeSize: file.size,
					createdAt: serverTimestamp(),
				});

			setStatus("done");
			setForm({ name: "", email: "", location: "" });
			setFile(null);
			setProgress(0);
		} catch (err: any) {
			console.error(err);
			setStatus("error");
			setError(err?.message ?? "Something went wrong.");
		}
	}

	if (status === "done") {
		return (
			<div className="join-container">
				<div className="join-card success-card">
					<div className="success-icon">✓</div>
					<h1>Thank You!</h1>
					<p>Your application has been received and is under review.</p>
					<p className="redirect-message">We'll get back to you soon!</p>
				</div>
			</div>
		);
	}

	return (
		<div className="join-container">
			<div className="join-card">
				<h1>Join the Simantic Team</h1>
				<p className="subtitle">We're looking for talented individuals to join our mission</p>

				{error && (
					<div className="error-message">
						{error}
					</div>
				)}

				<form onSubmit={onSubmit} className="join-form">
					<div className="form-group">
						<label htmlFor="name">Full Name *</label>
						<input
							type="text"
							id="name"
							name="name"
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
							placeholder="John Doe"
							required
							maxLength={100}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="email">Email *</label>
						<input
							type="email"
							id="email"
							name="email"
							value={form.email}
							onChange={(e) => setForm({ ...form, email: e.target.value })}
							placeholder="name@domain.com"
							required
							maxLength={160}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="location">Location</label>
						<input
							type="text"
							id="location"
							name="location"
							value={form.location}
							onChange={(e) => setForm({ ...form, location: e.target.value })}
							placeholder="City, Country"
							maxLength={100}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="resume">Resume (PDF) *</label>
						<input
							type="file"
							id="resume"
							name="resume"
							accept=".pdf,application/pdf"
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null)}
							required
							className="file-input"
						/>
						<span className="file-help">Max 10MB</span>
					</div>

					{status === "uploading" && (
						<div className="upload-progress">
							<div className="progress-bar">
								<div className="progress-fill" style={{ width: `${progress}%` }}></div>
							</div>
							<span className="progress-text">{progress}%</span>
						</div>
					)}

					<button 
						type="submit" 
						className="submit-button"
						disabled={status === "uploading" || status === "saving"}
					>
						{status === "uploading"
							? `Uploading… ${progress}%`
							: status === "saving"
							? "Saving…"
							: "Submit Application"}
					</button>
				</form>
			</div>
		</div>
	);
}
