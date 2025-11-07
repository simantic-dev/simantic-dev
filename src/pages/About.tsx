import { Container, Card, Row, Col } from 'react-bootstrap';

export default function About() {
  return (
    <Container className="my-4">
      <Card className="mx-auto shadow-sm" style={{ maxWidth: 820 }}>
        <Card.Body>
          <Card.Title className="mb-4 silkscreen-thin">About Simantic</Card.Title>
          
          <Row className="g-4">
            <Col xs={12}>
              <h2 className="h4 mb-3">Our Mission</h2>
              <p>
                Filler
              </p>
            </Col>

            <Col xs={12}>
              <h2 className="h4 mb-3">What We Do</h2>
              <p>
                Filler
              </p>
            </Col>

            <Col xs={12}>
              <h2 className="h4 mb-3">Our Vision</h2>
              <p>
                Filler
              </p>
            </Col>

            <Col xs={12}>
              <h2 className="h4 mb-3">Join Our Journey</h2>
              <p>
                Filler
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}