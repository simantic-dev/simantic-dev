import { Container, Card, Row, Col, Badge } from 'react-bootstrap';

export default function Featured() {
  return (
    <Container className="my-4">
      <Card className="mx-auto shadow-sm" style={{ maxWidth: 820 }}>
        <Card.Body>
          <Card.Title className="mb-4 silkscreen-thin">Featured Projects</Card.Title>
          
          <Row className="g-4">
            <Col xs={12}>
              <Card className="border-0 bg-light">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="h5">Smart PCB Analyzer</Card.Title>
                    <Badge bg="primary">Electronics</Badge>
                  </div>
                  <Card.Text>
                    An AI-powered tool that automatically analyzes PCB layouts for 
                    potential design issues, signal integrity problems, and optimization 
                    opportunities. Integrated with major EDA platforms.
                  </Card.Text>
                  <small className="text-muted">Technologies: AI/ML, KiCad API, Python</small>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12}>
              <Card className="border-0 bg-light">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="h5">Component Library Manager</Card.Title>
                    <Badge bg="success">Productivity</Badge>
                  </div>
                  <Card.Text>
                    A centralized component library system that syncs across teams, 
                    maintains version control for component symbols and footprints, 
                    and provides automated compliance checking.
                  </Card.Text>
                  <small className="text-muted">Technologies: React, Node.js, Database</small>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12}>
              <Card className="border-0 bg-light">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="h5">Circuit Simulation Engine</Card.Title>
                    <Badge bg="warning">Simulation</Badge>
                  </div>
                  <Card.Text>
                    High-performance SPICE-compatible simulation engine optimized 
                    for modern mixed-signal designs. Features real-time collaboration 
                    and cloud-based computation.
                  </Card.Text>
                  <small className="text-muted">Technologies: C++, CUDA, Cloud Computing</small>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} className="text-center">
              <p className="text-muted mt-3">
                Want to see your project featured here? <a href="/join">Join our team</a> or 
                reach out through our <a href="/waitlist">waitlist</a>.
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}