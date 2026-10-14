import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import rbacTestRoutes from './rbac-test.routes';
import dashboardRoutes from './dashboard.routes';
import studentRoutes from './student.routes';
import coachRoutes from './coach.routes';
import refereeRoutes from './referee.routes';
import liveScoreRoutes from './liveScore.routes';
import resultsRoutes from './results.routes';
import analyticsRoutes from './analytics.routes';
import notificationRoutes from './notification.routes';
import certificateRoutes from './certificate.routes';
import inventoryRoutes from './inventory.routes';
import feedbackRoutes from './feedback.routes';
import venueRoutes from './venue.routes';
import searchRoutes from './search.routes';
import auditRoutes from './audit.routes';
import sportRoutes from './sport.routes';
import teamRoutes from './team.routes';
import tournamentRoutes from './tournament.routes';
import fixtureRoutes from './fixture.routes';

const v1Router = Router();

// Mount Routes
v1Router.use('/', healthRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/rbac-test', rbacTestRoutes);
v1Router.use('/dashboard', dashboardRoutes);
v1Router.use('/student', studentRoutes);
v1Router.use('/coach', coachRoutes);
v1Router.use('/referee', refereeRoutes);
v1Router.use('/live', liveScoreRoutes);
v1Router.use('/results', resultsRoutes);
v1Router.use('/analytics', analyticsRoutes);
v1Router.use('/notifications', notificationRoutes);
v1Router.use('/certificates', certificateRoutes);
v1Router.use('/inventory', inventoryRoutes);
v1Router.use('/feedback', feedbackRoutes);
v1Router.use('/venues', venueRoutes);
v1Router.use('/search', searchRoutes);
v1Router.use('/audit', auditRoutes);
v1Router.use('/sports', sportRoutes);
v1Router.use('/teams', teamRoutes);
v1Router.use('/tournaments', tournamentRoutes);
v1Router.use('/fixtures', fixtureRoutes);

export default v1Router;
