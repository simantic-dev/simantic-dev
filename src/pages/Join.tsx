import { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import {
	Container,
	Card,
	Row,
	Col,
	Form,
	Button,
	ProgressBar,
	Alert,
} from 'react-bootstrap';

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

	return (
		<Container className="my-4">
			<Card className="mx-auto shadow-sm" style={{ maxWidth: 820 }}>
				<Card.Body>
					<Card.Title className="mb-3 silkscreen-thin">Join the Simantic Team</Card.Title>
					<Form onSubmit={onSubmit} className="text-start">
						<Row className="g-3">
							<Col xs={12}>
								<Form.Group controlId="name">
									<Form.Label>Full name</Form.Label>
									<Form.Control
										placeholder="Full name"
										value={form.name}
										onChange={(e) => setForm({ ...form, name: e.target.value })}
										required
										maxLength={100}
									/>
								</Form.Group>
							</Col>
							<Col xs={12}>
								<Form.Group controlId="email">
									<Form.Label>Email</Form.Label>
									<Form.Control
										type="email"
										placeholder="name@domain.com"
										value={form.email}
										onChange={(e) => setForm({ ...form, email: e.target.value })}
										required
										maxLength={160}
									/>
								</Form.Group>
							</Col>

							<Col xs={12}>
								<Form.Group controlId="location">
									<Form.Label>Location</Form.Label>
									<Form.Control
										placeholder="City, Country"
										value={form.location}
										onChange={(e) => setForm({ ...form, location: e.target.value })}
										maxLength={100}
									/>
								</Form.Group>
							</Col>

							<Col xs={12}>
								<Form.Group controlId="resume">
									<Form.Label>Resume (PDF)</Form.Label>
									<Form.Control
										type="file"
										accept=".pdf,application/pdf"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null)}
										required
									/>
									<Form.Text className="text-muted">Max 10MB.</Form.Text>
								</Form.Group>
							</Col>
						</Row>

						<div className="mt-3">
							{status === "uploading" && (
								<ProgressBar now={progress} label={`${progress}%`} animated striped />
							)}

							{status === "done" && (
								<Alert className="mt-3" variant="success">Your application has been received.</Alert>
							)}
							{status === "error" && (
								<Alert className="mt-3" variant="danger">{error}</Alert>
							)}
						</div>

						<div className="d-flex justify-content-end mt-4">
							<Button
								variant="dark"
								type="submit"
								disabled={status === "uploading" || status === "saving"}
							>
								{status === "uploading"
									? `Uploading… ${progress}%`
									: status === "saving"
									? "Saving…"
									: "Submit"}
							</Button>
						</div>
					</Form>
				</Card.Body>
			</Card>
		</Container>
	);
}
