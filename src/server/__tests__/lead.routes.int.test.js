import request from 'supertest';
import app from '../index'; // Adjust path if needed
import mongoose from 'mongoose';
import Lead from '../../common/models/lead';

// You may need to adjust the import for your Express app

describe('Lead API Integration', () => {
  let server;
  beforeAll(async () => {
    server = app.listen(4001); // Use a test port
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  afterEach(async () => {
    await Lead.deleteMany({});
  });

  it('should create a new lead', async () => {
    const leadData = {
      name: 'Test Lead',
      email: 'testlead@example.com',
      company: 'Test Co',
      employees: '1-10',
      phone: '1234567890',
      timeline: 'Q3 2025',
      message: 'Interested in demo',
      stage: 'open',
      source: 'website',
      notes: 'Initial contact',
      status: 'lead',
      boughtPackage: false
    };
    const res = await request(server)
      .post('/api/v1/lead/new')
      .send({ lead: leadData })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.lead).toHaveProperty('_id');
    expect(res.body.data.lead.name).toBe('Test Lead');
  });

  it('should get a list of leads', async () => {
    await Lead.create({ name: 'Lead1', email: 'l1@example.com', company: 'Test', employees: '1-10', phone: '123', timeline: '', message: '', stage: 'open', source: 'website', notes: '', status: 'lead', boughtPackage: false });
    const res = await request(server)
      .post('/api/v1/lead/list')
      .send({ pageNum: 1, pageSize: 10, filters: {} })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.leadList)).toBe(true);
  });

  it('should get a lead by id', async () => {
    const lead = await Lead.create({ name: 'Lead2', email: 'l2@example.com', company: 'Test', employees: '1-10', phone: '123', timeline: '', message: '', stage: 'open', source: 'website', notes: '', status: 'lead', boughtPackage: false });
    const res = await request(server)
      .get(`/api/v1/lead/${lead._id}`)
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.lead).toHaveProperty('_id', lead._id.toString());
  });

  it('should update a lead', async () => {
    const updatedLead = {
  name: 'Lead3 Updated',
  email: lead.email,
  company: lead.company,
  employees: lead.employees,
  phone: lead.phone,
  timeline: lead.timeline,
  message: lead.message,
  stage: lead.stage,
  source: lead.source,
  notes: lead.notes,
  status: lead.status,
  boughtPackage: lead.boughtPackage
};
const res = await request(server)
  .post(`/api/v1/lead/${lead._id}/update`)
  .send({ lead: updatedLead })
  .set('Content-Type', 'application/json');
expect(res.statusCode).toBe(200);
expect(res.body.data.lead.name).toBe('Lead3 Updated');
  });

  it('should delete a lead', async () => {
    const lead = await Lead.create({ name: 'Lead4', email: 'l4@example.com', company: 'Test', employees: '1-10', phone: '123', timeline: '', message: '', stage: 'open', source: 'website', notes: '', status: 'lead', boughtPackage: false });
    const res = await request(server)
      .post(`/api/v1/lead/${lead._id}/remove`)
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.hasLeadDeleted).toBe(true);
  });
});
