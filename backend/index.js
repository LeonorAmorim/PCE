const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 5001;
const { createFHIRBundle } = require('./fhirbundle');

app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

const pool = new Pool({
  user: 'nextgen_user',
  host: 'localhost',
  database: 'pce_forms',
  password: 'nextgen_password',
  port: 5432
});

const JSON_BACKUP_PATH = path.join(__dirname, 'compositions_backup.json');
const fhirBundlesDir = path.join(__dirname, 'fhir_bundles');

// Utils
const extractContent = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.startsWith('{"blocks":')) {
    try {
      const parsed = JSON.parse(value);
      return parsed.blocks[0]?.text || null;
    } catch {
      return value;
    }
  }
  return value;
};

const processNumericField = (formValues, basePath) => {
  const value = formValues[`${basePath}.value`];
  const unit = formValues[`${basePath}.unit`];
  if (value === undefined && unit === undefined) return null;
  const result = {};
  if (value !== undefined && value !== null) result.value = value;
  if (unit !== undefined && unit !== null) result.unit = unit;
  return Object.keys(result).length > 0 ? result : null;
};

const processFormData = (formValues) => {
  try {
    const getValue = (path) => extractContent(formValues[path]);

    const processDualField = (selectPath, commentPath, fieldName) => {
      const selected = getValue(selectPath);
      const comment = getValue(commentPath);
      const result = {};
      if (selected !== null && selected !== undefined) result[fieldName] = selected;
      if (comment) result[`${fieldName}_comment`] = comment;
      return result;
    };

    // Blood Pressure
    const blood_pressure = {
      systolic: processNumericField(formValues, 'items.0.0.items.0.value'),
      diastolic: processNumericField(formValues, 'items.0.0.items.1.value'),
      comment: getValue('items.0.0.items.2.value'),
      ...processDualField('items.0.0.items.3.value', null, 'position'),
      ...processDualField('items.0.0.items.4.value', null, 'sleep_status'),
      inclination: processNumericField(formValues, 'items.0.0.items.5.value'),
      measurement_time: getValue('items.0.0.items.6.value'),
      ...processDualField('items.0.0.items.7.value', null, 'cuff_size'),
      ...processDualField('items.0.0.items.8.value', 'items.0.0.items.9.value', 'measurement_location'),
      ...processDualField('items.0.0.items.10.value', null, 'method')
    };

    // BMI
    const bmi = {
      bmi_value: processNumericField(formValues, 'items.0.1.items.0.value'),
      comment: getValue('items.0.1.items.1.value'),
      measurement_time: getValue('items.0.1.items.2.value')
    };

    // Pulse Oximetry
    const pulse_oximetry = {
      spo2: getValue('items.0.2.items.0.value'),
      comment: getValue('items.0.2.items.1.value'),
      measurement_time: getValue('items.0.2.items.2.value'),
      sensor_location: getValue('items.0.2.items.3.value')
    };

    // Pulse
    const pulse = {
      ...processDualField('items.0.3.items.0.value', null, 'presence'),
      rate: processNumericField(formValues, 'items.0.3.items.1.value'),
      ...processDualField('items.0.3.items.2.value', null, 'regularity'),
      ...processDualField('items.0.3.items.3.value', null, 'irregularity_type'),
      comment: getValue('items.0.3.items.4.value'),
      ...processDualField('items.0.3.items.5.value', null, 'position'),
      measurement_time: getValue('items.0.3.items.6.value'),
      ...processDualField('items.0.3.items.7.value', null, 'method'),
      ...processDualField('items.0.3.items.8.value', 'items.0.3.items.9.value', 'body_location')
    };

    // Respiration
    const respiration = {
      ...processDualField('items.0.4.items.0.value', null, 'presence'),
      rate: processNumericField(formValues, 'items.0.4.items.1.value'),
      ...processDualField('items.0.4.items.2.value', null, 'regularity'),
      ...processDualField('items.0.4.items.3.value', null, 'depth'),
      comment: getValue('items.0.4.items.4.value'),
      ...processDualField('items.0.4.items.5.value', null, 'body_position'),
      measurement_time: getValue('items.0.4.items.6.value')
    };

    // Body Temperature
    const body_temperature = {
      temperature: processNumericField(formValues, 'items.0.5.items.0.value'),
      comment: getValue('items.0.5.items.1.value'),
      ...processDualField('items.0.5.items.2.value', 'items.0.5.items.3.value', 'body_exposure'),
      measurement_time: getValue('items.0.5.items.4.value'),
      ...processDualField('items.0.5.items.5.value', 'items.0.5.items.6.value', 'measurement_location')
    };

    const formData = {
      blood_pressure: Object.keys(blood_pressure).length > 0 ? blood_pressure : undefined,
      bmi: Object.keys(bmi).length > 0 ? bmi : undefined,
      pulse_oximetry: Object.keys(pulse_oximetry).length > 0 ? pulse_oximetry : undefined,
      pulse: Object.keys(pulse).length > 0 ? pulse : undefined,
      respiration: Object.keys(respiration).length > 0 ? respiration : undefined,
      body_temperature: Object.keys(body_temperature).length > 0 ? body_temperature : undefined
    };

    const cleanData = (obj) => {
      if (typeof obj !== 'object' || obj === null) return obj;
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined) {
          const cleanedValue = cleanData(value);
          if (cleanedValue !== null && cleanedValue !== undefined) {
            if (typeof cleanedValue === 'object' && !Array.isArray(cleanedValue)) {
              if (Object.keys(cleanedValue).length > 0) cleaned[key] = cleanedValue;
            } else {
              cleaned[key] = cleanedValue;
            }
          }
        }
      }
      return Object.keys(cleaned).length > 0 ? cleaned : undefined;
    };

    return cleanData(formData);
  } catch (err) {
    console.error('Error processing form data:', err);
    return null;
  }
};

// REGISTER
app.post('/api/register', async (req, res) => {
  const {
    numero_utente, nome, data_nascimento, genero, nif, telefone,
    email, morada, codigo_postal, localidade, pais, password
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(`
      INSERT INTO public.utente (
        numero_utente, nome, data_nascimento, genero, nif, telefone,
        email, morada, codigo_postal, localidade, pais, password
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    `, [
      numero_utente, nome, data_nascimento, genero, nif, telefone,
      email, morada, codigo_postal, localidade, pais, hashedPassword
    ]);

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ success: false, error: 'Error registering user' });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  const { numero_utente, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM public.utente WHERE numero_utente = $1', [numero_utente]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'User number not found' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      numero_utente: user.numero_utente
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login error' });
  }
});

// COMPOSITIONS
app.post('/api/compositions', async (req, res) => {
  try {
    if (!req.body?.composition || !req.body?.numero_utente) {
      return res.status(400).json({ 
        success: false,
        error: 'Form data or user number missing'
      });
    }

    let composition = req.body.composition;
    const numero_utente = req.body.numero_utente;

    if (typeof composition === 'string') {
      try {
        composition = JSON.parse(composition);
      } catch {
        return res.status(400).json({
          success: false,
          error: 'Invalid data format'
        });
      }
    }

    const processedData = processFormData(composition);
    if (!processedData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data structure'
      });
    }

    const id = uuidv4();
    const created_at = new Date();

    const dbRecord = {
      id,
      created_at,
      form_data: processedData
    };

    const backupRecord = {
      id,
      created_at,
      numero_utente,
      form_data: processedData,
      raw_data: composition
    };

    await pool.query(
      'INSERT INTO public.formularios (id, forms, created_at, numero_utente) VALUES ($1, $2, $3, $4)',
      [id, dbRecord, created_at, numero_utente]
    );

    // Safe reading of backup file
    let allBackups = [];
    if (fs.existsSync(JSON_BACKUP_PATH)) {
      try {
        const content = fs.readFileSync(JSON_BACKUP_PATH, 'utf8');
        allBackups = content ? JSON.parse(content) : [];
      } catch (err) {
        console.error('Error reading JSON backup file:', err);
        allBackups = [];
      }
    }
    allBackups.push(backupRecord);
    fs.writeFileSync(JSON_BACKUP_PATH, JSON.stringify(allBackups, null, 2));

    // Create FHIR Bundle
    if (!fs.existsSync(fhirBundlesDir)) {
      fs.mkdirSync(fhirBundlesDir);
    }
    const fhirBundle = createFHIRBundle(processedData, numero_utente);
    const fhirBundlePath = path.join(fhirBundlesDir, `${id}.json`);
    fs.writeFileSync(fhirBundlePath, JSON.stringify(fhirBundle, null, 2));

    res.status(201).json({
      success: true,
      id,
      timestamp: created_at,
      data: processedData
    });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET all compositions
app.get('/api/compositions', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, forms as form_data, created_at, numero_utente FROM public.formularios ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error fetching data' });
  }
});

// Ver só os formulários de certo utente
app.get('/api/formularios/:numero_utente', async (req, res) => {
  const { numero_utente } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM public.formularios WHERE numero_utente = $1 ORDER BY created_at DESC`,
      [numero_utente]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Erro ao buscar formulários:', err);
    res.status(500).json({ success: false, error: 'Erro ao buscar formulários' });
  }
});


app.get('/api/utente/:numero_utente', async (req, res) => {
  const { numero_utente } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM utente WHERE numero_utente = $1',
      [numero_utente]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const utente = result.rows[0];
    delete utente.password; // Remove sensitive info
    res.json({ success: true, utente });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


const fsPromises = require('fs').promises; // add this at the top with other requires

// GET latest FHIR bundle
app.get('/api/fhir-bundle/latest', async (req, res) => {
  try {
    // Read all files in the fhirBundlesDir
    const files = await fsPromises.readdir(fhirBundlesDir);

    if (!files.length) {
      return res.status(404).json({ success: false, error: 'No FHIR bundles found' });
    }

    // Sort files by creation time descending (latest first)
    const filesWithStats = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(fhirBundlesDir, file);
        const stats = await fsPromises.stat(filePath);
        return { file, time: stats.birthtimeMs };
      })
    );

    filesWithStats.sort((a, b) => b.time - a.time);

    // Read latest file content
    const latestFilePath = path.join(fhirBundlesDir, filesWithStats[0].file);
    const content = await fsPromises.readFile(latestFilePath, 'utf8');

    const bundle = JSON.parse(content);

    res.json(bundle);
  } catch (err) {
    console.error('Error fetching latest FHIR bundle:', err);
    res.status(500).json({ success: false, error: 'Failed to get latest FHIR bundle' });
  }
});

// pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'formularios'")
//   .then(res => {
//     console.log("🧩 Colunas reais da tabela formularios:", res.rows.map(r => r.column_name));
//   })
//   .catch(err => {
//     console.error("❌ Erro ao ler colunas da tabela:", err);
//   });

// Rota para servir o ficheiro compositions_backup.json
app.get('/compositions_backup', (req, res) => {
  fs.readFile(JSON_BACKUP_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o ficheiro JSON de backup:', err);
      return res.status(500).json({ error: 'Erro interno ao ler backup' });
    }

    try {
      const json = JSON.parse(data);
      res.json(json);
    } catch (parseErr) {
      console.error('Erro ao fazer parse do backup JSON:', parseErr);
      res.status(500).json({ error: 'Erro ao interpretar ficheiro JSON' });
    }
  });
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});