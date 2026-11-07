import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Nexus API Full Flow (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let workspaceId: string;
  let projectId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true })); // Ensure validation works in tests too
    await app.init();
  });

  // 1. Auth Flow
  it('should register and login', async () => {
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'tester@nexus.com',
      password: 'password123',
    });

    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'tester@nexus.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    authToken = res.body.access_token;
    expect(authToken).toBeDefined();
  });

  // 2. Workspace Flow
  it('should create a workspace', async () => {
    const res = await request(app.getHttpServer())
      .post('/workspaces')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Nexus Test Workspace' });

    expect(res.status).toBe(201);
    workspaceId = res.body.id;
  });

  // 3. Project + Audit Flow
  it('should create a project and audit log it', async () => {
    const res = await request(app.getHttpServer())
      .post(`/workspaces/${workspaceId}/projects`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Project' });

    expect(res.status).toBe(201);
    projectId = res.body.id;

    // Verify Audit Log was created
    const auditRes = await request(app.getHttpServer())
      .get(`/workspaces/${workspaceId}/audit-logs`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(auditRes.body.length).toBeGreaterThan(0);
    expect(auditRes.body[0].action).toBe('PROJECT_CREATED');
  });

  afterAll(async () => {
    await app.close();
  });
});