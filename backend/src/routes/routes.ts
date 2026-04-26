import { Router } from 'express';
import { getSettings } from '../controllers/SettingsController.js';
import { MeetingController } from '../controllers/MeetingController.js';
import { NoteController } from '../controllers/NoteController.js';
import { AuthController } from '../controllers/AuthController.js';
import { SectorController } from '../controllers/SectorController.js';
import { MeetingTypeController } from '../controllers/MeetingTypeController.js';

const routes = Router();

// Configurações
routes.get('/settings', getSettings);

// Setores
routes.get('/sectors', SectorController.list);
routes.post('/sectors', SectorController.create);
routes.delete('/sectors/:id', SectorController.delete);

// Reuniões
routes.get('/meetings', MeetingController.list);
routes.post('/meetings', MeetingController.create);
routes.put('/meetings/:id', MeetingController.update);
routes.delete('/meetings/:id', MeetingController.delete);

routes.get('/meeting-types', MeetingTypeController.list);
routes.post('/meeting-types', MeetingTypeController.create);
routes.delete('/meeting-types/:id', MeetingTypeController.delete);

// Notas Diárias
routes.get('/notes', NoteController.get);
routes.post('/notes', NoteController.upsert);

// Autenticação
routes.post('/login', AuthController.login);

export default routes;