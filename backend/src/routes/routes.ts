import { Router } from 'express';
import { getSettings } from '../controllers/SettingsController.js';
import { MeetingController } from '../controllers/MeetingController.js';
import { listSectors } from '../controllers/SectorController.js';
import { NoteController } from '../controllers/NoteController.js';
import { AuthController } from '../controllers/AuthController.js';
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

// Notas Diárias
routes.get('/notes', NoteController.getByDate);
routes.post('/notes', NoteController.save);

// Autenticação
routes.post('/login', AuthController.login);

export default routes;