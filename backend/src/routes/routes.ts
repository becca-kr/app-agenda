import { Router } from 'express';
import { getSettings } from '../controllers/SettingsController.js';

const routes = Router();

routes.get('/settings', getSettings);

export default routes;