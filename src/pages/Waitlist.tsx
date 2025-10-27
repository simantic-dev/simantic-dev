import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Container, Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';

type Status = 'idle' | 'saving' | 'done' | 'error';

export default function Waitlist() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    location: '',
    useCase: '',
    company: '',
    position: '',
  });
  const [useCaseOpts, setUseCaseOpts] = useState({ KiCad: false, Altium: false, Other: false, None: false });
  const [useCaseOther, setUseCaseOther] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  function validate() {
    const name = form.name.trim();
    const email = form.email.trim();
    const location = form.location.trim();
  // compute useCase string from checkbox selections or Other text
    const selections: string[] = [];
    if (useCaseOpts.None) {
      selections.push('None');
    } else {
      if (useCaseOpts.KiCad) selections.push('KiCad');
      if (useCaseOpts.Altium) selections.push('Altium');
      if (useCaseOpts.Other && useCaseOther.trim()) selections.push(useCaseOther.trim());
    }
    const useCase = selections.join(', ');
    const company = form.company.trim();
    const position = form.position.trim();

    if (name.length <= 1 || name.length > 100) return 'Name must be 2-100 characters.';
    if (email.length <= 3 || email.length > 100) return 'Email must be 4-100 characters.';
    if (location.length <= 3 || location.length > 100) return 'Location must be 4-100 characters.';
    if (useCase.length <= 3 || useCase.length > 100) return 'Use case must be 4-100 characters.';
    if (company.length <= 1 || company.length > 100) return 'Company must be 2-100 characters.';
    if (position.length <= 1 || position.length > 100) return 'Position must be 2-100 characters.';

    // Basic email pattern check (not exhaustive)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) return 'Please enter a valid email address.';

    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setStatus('saving');

      // compute useCase again for the document (must match validate logic)
      const selections: string[] = [];
      if (useCaseOpts.None) {
        selections.push('None');
      } else {
        if (useCaseOpts.KiCad) selections.push('KiCad');
        if (useCaseOpts.Altium) selections.push('Altium');
        if (useCaseOpts.Other && useCaseOther.trim()) selections.push(useCaseOther.trim());
      }
      const computedUseCase = selections.join(', ');

      await addDoc(collection(db, 'waitlist'), {
        name: form.name.trim(),
        email: form.email.trim(),
        location: form.location.trim(),
        useCase: computedUseCase,
        company: form.company.trim(),
        position: form.position.trim(),
        createdAt: serverTimestamp(),
      });

  setStatus('done');
  setForm({ name: '', email: '', location: '', useCase: '', company: '', position: '' });
  setUseCaseOpts({ KiCad: false, Altium: false, Other: false, None: false });
  setUseCaseOther('');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setError(err?.message ?? 'Failed to submit — please try again.');
    }
  }

  return (
    <Container className="my-4">
      <Card className="mx-auto shadow-sm" style={{ maxWidth: 820 }}>
        <Card.Body>
          <Card.Title className="mb-3 silkscreen-thin">Join the Waitlist</Card.Title>
          <Form onSubmit={onSubmit} className="text-start">
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group controlId="wl-name">
                  <Form.Label>Name</Form.Label>
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
                <Form.Group controlId="wl-email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="name@domain.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    maxLength={100}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group controlId="wl-location">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    placeholder="City, Country"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    required
                    maxLength={100}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group controlId="wl-usecase">
                  <Form.Label>Please select all PCB editors you use</Form.Label>
                  <div className="d-flex flex-column">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Form.Check
                        type="checkbox"
                        id="usecase-kicad"
                        label="KiCad"
                        checked={useCaseOpts.KiCad}
                        disabled={useCaseOpts.None}
                        onChange={(e) => setUseCaseOpts(prev => ({ ...prev, KiCad: e.target.checked, None: e.target.checked ? false : prev.None }))}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Form.Check
                        type="checkbox"
                        id="usecase-altium"
                        label="Altium"
                        checked={useCaseOpts.Altium}
                        disabled={useCaseOpts.None}
                        onChange={(e) => setUseCaseOpts(prev => ({ ...prev, Altium: e.target.checked, None: e.target.checked ? false : prev.None }))}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Form.Check
                        type="checkbox"
                        id="usecase-other"
                        label="Other"
                        checked={useCaseOpts.Other}
                        disabled={useCaseOpts.None}
                        onChange={(e) => setUseCaseOpts(prev => ({ ...prev, Other: e.target.checked, None: e.target.checked ? false : prev.None }))}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Form.Check
                        type="checkbox"
                        id="usecase-none"
                        label="None"
                        checked={useCaseOpts.None}
                        disabled={useCaseOpts.KiCad || useCaseOpts.Altium || useCaseOpts.Other}
                        onChange={(e) => setUseCaseOpts(prev => ({ ...prev, None: e.target.checked, KiCad: e.target.checked ? false : prev.KiCad, Altium: e.target.checked ? false : prev.Altium, Other: e.target.checked ? false : prev.Other }))}
                      />
                    </div>
                  </div>

                  {useCaseOpts.Other && (
                    <Form.Control
                      className="mt-2"
                      placeholder="Other (please specify)"
                      value={useCaseOther}
                      onChange={(e) => setUseCaseOther(e.target.value)}
                      maxLength={100}
                    />
                  )}
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group controlId="wl-company">
                  <Form.Label>Company</Form.Label>
                  <Form.Control
                    placeholder="Company name"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    required
                    maxLength={100}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group controlId="wl-position">
                  <Form.Label>Position</Form.Label>
                  <Form.Control
                    placeholder="Your title/role"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    required
                    maxLength={100}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-3">
              {status === 'done' && <Alert variant="success">Thanks — we'll be in touch.</Alert>}
              {status === 'error' && <Alert variant="danger">{error}</Alert>}
            </div>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="dark" type="submit" disabled={status === 'saving'}>
                {status === 'saving' ? 'Saving…' : 'Join Waitlist'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
