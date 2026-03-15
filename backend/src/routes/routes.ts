import { Router } from 'express';
import { getSettings } from '../controllers/SettingsController.js';
import { MeetingController } from '../controllers/MeetingController.js';
import { listSectors } from '../controllers/SectorController.js';

const routes = Router();

// Configurações
routes.get('/settings', getSettings);

// Setores
routes.get('/sectors', listSectors);

// Reuniões
routes.get('/meetings', MeetingController.list);
routes.post('/meetings', MeetingController.create);
routes.put('/meetings/:id', MeetingController.update);
routes.delete('/meetings/:id', MeetingController.delete);

export default routes;