import { Container, Card, Row, Col, Badge, Button } from 'react-bootstrap';

export default function CaseStudies() {
  return (
    <Container className="my-4">
      <Card className="mx-auto shadow-sm" style={{ maxWidth: 820 }}>
        <Card.Body>
          <Card.Title className="mb-4 silkscreen-thin">Case Studies</Card.Title>
          
          <Row className="g-4">
            <Col xs={12}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <Card.Title className="h5">Startup to Scale: IoT Device Design</Card.Title>
                      <Badge bg="info" className="me-2">IoT</Badge>
                      <Badge bg="secondary">Hardware</Badge>
                    </div>
                  </div>
                  <Card.Text>
                    <strong>Challenge:</strong> A startup needed to rapidly prototype and scale 
                    production of a wireless sensor device while maintaining design quality 
                    and reducing time-to-market.
                  </Card.Text>
                  <Card.Text>
                    <strong>Solution:</strong> Implemented our integrated design workflow, 
                    automated testing protocols, and component verification system. 
                    Reduced design iterations by 60% and cut development time in half.
                  </Card.Text>
                  <Card.Text>
                    <strong>Results:</strong> Successfully launched product 4 months ahead 
                    of schedule, achieved 99.2% first-pass yield in manufacturing.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <Card.Title className="h5">Enterprise PCB Migration</Card.Title>
                      <Badge bg="warning" className="me-2">Enterprise</Badge>
                      <Badge bg="dark">Migration</Badge>
                    </div>
                  </div>
                  <Card.Text>
                    <strong>Challenge:</strong> Large electronics manufacturer needed to 
                    migrate 500+ legacy PCB designs from proprietary tools to modern 
                    open-source alternatives without losing design integrity.
                  </Card.Text>
                  <Card.Text>
                    <strong>Solution:</strong> Developed custom migration tools and 
                    validation workflows. Provided training and ongoing support for 
                    engineering teams across multiple facilities.
                  </Card.Text>
                  <Card.Text>
                    <strong>Results:</strong> 100% successful migration with zero data 
                    loss, $2M annual savings in licensing costs, 40% improvement in 
                    design collaboration.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <Card.Title className="h5">Academic Research Platform</Card.Title>
                      <Badge bg="success" className="me-2">Research</Badge>
                      <Badge bg="primary">Education</Badge>
                    </div>
                  </div>
                  <Card.Text>
                    <strong>Challenge:</strong> University research lab needed collaborative 
                    platform for students and faculty to work on complex RF circuit designs 
                    with version control and simulation capabilities.
                  </Card.Text>
                  <Card.Text>
                    <strong>Solution:</strong> Deployed cloud-based design environment 
                    with integrated simulation, automated grading system, and real-time 
                    collaboration features tailored for educational use.
                  </Card.Text>
                  <Card.Text>
                    <strong>Results:</strong> Enabled remote learning during pandemic, 
                    increased student engagement by 85%, published 12 research papers 
                    using the platform.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} className="text-center">
              <div className="border-top pt-4">
                <h6>Ready to Transform Your Design Process?</h6>
                <p className="text-muted mb-3">
                  See how our solutions can accelerate your next project.
                </p>
                <Button variant="dark" href="/join" className="me-2">
                  Join Our Team
                </Button>
                <Button variant="outline-dark" href="/waitlist">
                  Get Early Access
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}