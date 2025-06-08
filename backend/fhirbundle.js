const { v4: uuidv4 } = require('uuid');

function createObservation(resourceId, status, category, code, value, unit, effectiveDateTime) {
  const observation = {
    resourceType: "Observation",
    id: resourceId,
    status: status || "final",
    category: [{
      coding: [{
        system: "http://terminology.hl7.org/CodeSystem/observation-category",
        code: category.code,
        display: category.display
      }]
    }],
    code: {
      coding: [{
        system: code.system,
        code: code.code,
        display: code.display
      }],
      text: code.display
    },
    effectiveDateTime,
    subject: {
      reference: `Patient/${code.patientId}`
    },
    valueQuantity: (typeof value === 'number') ? {
      value,
      unit,
      system: "http://unitsofmeasure.org",
      code: unit
    } : undefined,
    valueString: (typeof value === 'string') ? value : undefined,
  };

  Object.keys(observation).forEach(key => {
    if (observation[key] === undefined) delete observation[key];
  });

  return observation;
}

function createFHIRBundle(formData, patientId) {
  const bundleId = uuidv4();
  const timestamp = new Date().toISOString();
  const observations = [];

  const pushObs = (codeInfo, value, unit) => {
    if (value === null || value === undefined) return;
    const obs = createObservation(
      uuidv4(),
      "final",
      { code: "vital-signs", display: "Vital Signs" },
      { ...codeInfo, patientId },
      value,
      unit,
      timestamp
    );
    observations.push(obs);
  };

  // Utility for numeric fields
  const getValueAndUnit = (field) => {
    if (typeof field === 'object' && field !== null) {
      return [field.value, field.unit];
    }
    return [field, null];
  };

  // Blood Pressure
  const bp = formData.blood_pressure;
  if (bp) {
    if (bp.systolic) {
      const [val, unit] = getValueAndUnit(bp.systolic);
      pushObs({ system: "http://loinc.org", code: "8480-6", display: "Systolic blood pressure" }, val, unit || "mmHg");
    }
    if (bp.diastolic) {
      const [val, unit] = getValueAndUnit(bp.diastolic);
      pushObs({ system: "http://loinc.org", code: "8462-4", display: "Diastolic blood pressure" }, val, unit || "mmHg");
    }
    if (bp.comment) {
      pushObs({ system: "http://loinc.org", code: "75325-1", display: "Blood pressure comment" }, bp.comment, null);
    }
    if (bp.position) {
      pushObs({ system: "http://loinc.org", code: "8352-7", display: "Body position" }, bp.position, null);
    }
    if (bp.sleep_status) {
      pushObs({ system: "http://loinc.org", code: "75323-6", display: "Sleep status" }, bp.sleep_status, null);
    }
    if (bp.inclination) {
      const [val, unit] = getValueAndUnit(bp.inclination);
      pushObs({ system: "http://loinc.org", code: "82810-3", display: "Body inclination" }, val, unit || "deg");
    }
    if (bp.cuff_size) {
      pushObs({ system: "http://loinc.org", code: "75327-7", display: "Cuff size" }, bp.cuff_size, null);
    }
    if (bp.measurement_location) {
      pushObs({ system: "http://loinc.org", code: "8354-3", display: "Measurement location" }, bp.measurement_location, null);
    }
    if (bp.measurement_location_comment) {
      pushObs({ system: "http://loinc.org", code: "75326-9", display: "Measurement location comment" }, bp.measurement_location_comment, null);
    }
    if (bp.method) {
      pushObs({ system: "http://loinc.org", code: "75329-3", display: "Measurement method" }, bp.method, null);
    }
  }

  // BMI
  const bmi = formData.bmi;
  if (bmi) {
    if (bmi.bmi_value) {
      const [val, unit] = getValueAndUnit(bmi.bmi_value);
      pushObs({ system: "http://loinc.org", code: "39156-5", display: "BMI" }, val, unit || "kg/m2");
    }
    if (bmi.comment) {
      pushObs({ system: "http://loinc.org", code: "69765-6", display: "BMI comment" }, bmi.comment, null);
    }
  }

  // Pulse Oximetry
  const po = formData.pulse_oximetry;
  if (po) {
    if (po.spo2) {
      pushObs({ system: "http://loinc.org", code: "59408-5", display: "Oxygen saturation" }, po.spo2, "%");
    }
    if (po.comment) {
      pushObs({ system: "http://loinc.org", code: "75324-4", display: "SpO2 comment" }, po.comment, null);
    }
    if (po.sensor_location) {
      pushObs({ system: "http://loinc.org", code: "75328-5", display: "Sensor location" }, po.sensor_location, null);
    }
  }

  // Pulse
  const pulse = formData.pulse;
  if (pulse) {
    if (pulse.presence) {
      pushObs({ system: "http://loinc.org", code: "46098-0", display: "Pulse presence" }, pulse.presence, null);
    }
    if (pulse.rate) {
      const [val, unit] = getValueAndUnit(pulse.rate);
      pushObs({ system: "http://loinc.org", code: "8867-4", display: "Pulse rate" }, val, unit || "/min");
    }
    if (pulse.regularity) {
      pushObs({ system: "http://loinc.org", code: "75332-7", display: "Pulse regularity" }, pulse.regularity, null);
    }
    if (pulse.irregularity_type) {
      pushObs({ system: "http://loinc.org", code: "75333-5", display: "Pulse irregularity type" }, pulse.irregularity_type, null);
    }
    if (pulse.comment) {
      pushObs({ system: "http://loinc.org", code: "75334-3", display: "Pulse comment" }, pulse.comment, null);
    }
    if (pulse.position) {
      pushObs({ system: "http://loinc.org", code: "8352-7", display: "Pulse body position" }, pulse.position, null);
    }
    if (pulse.method) {
      pushObs({ system: "http://loinc.org", code: "75331-9", display: "Pulse method" }, pulse.method, null);
    }
    if (pulse.body_location) {
      pushObs({ system: "http://loinc.org", code: "85355-6", display: "Pulse location" }, pulse.body_location, null);
    }
    if (pulse.body_location_comment) {
      pushObs({ system: "http://loinc.org", code: "75330-1", display: "Pulse location comment" }, pulse.body_location_comment, null);
    }
  }

  // Respiration
  const resp = formData.respiration;
  if (resp) {
    if (resp.presence) {
      pushObs({ system: "http://loinc.org", code: "46098-0", display: "Respiration presence" }, resp.presence, null);
    }
    if (resp.rate) {
      const [val, unit] = getValueAndUnit(resp.rate);
      pushObs({ system: "http://loinc.org", code: "9279-1", display: "Respiratory rate" }, val, unit || "/min");
    }
    if (resp.regularity) {
      pushObs({ system: "http://loinc.org", code: "75335-0", display: "Respiration regularity" }, resp.regularity, null);
    }
    if (resp.depth) {
      pushObs({ system: "http://loinc.org", code: "75336-8", display: "Respiration depth" }, resp.depth, null);
    }
    if (resp.comment) {
      pushObs({ system: "http://loinc.org", code: "75337-6", display: "Respiration comment" }, resp.comment, null);
    }
    if (resp.body_position) {
      pushObs({ system: "http://loinc.org", code: "8352-7", display: "Body position" }, resp.body_position, null);
    }
  }

  // Body Temperature
  const temp = formData.body_temperature;
  if (temp) {
    if (temp.temperature) {
      const [val, unit] = getValueAndUnit(temp.temperature);
      pushObs({ system: "http://loinc.org", code: "8310-5", display: "Body temperature" }, val, unit || "°C");
    }
    if (temp.comment) {
      pushObs({ system: "http://loinc.org", code: "75338-4", display: "Temperature comment" }, temp.comment, null);
    }
    if (temp.body_exposure) {
      pushObs({ system: "http://loinc.org", code: "75339-2", display: "Body exposure" }, temp.body_exposure, null);
    }
    if (temp.body_exposure_comment) {
      pushObs({ system: "http://loinc.org", code: "75340-0", display: "Body exposure comment" }, temp.body_exposure_comment, null);
    }
    if (temp.measurement_location) {
      pushObs({ system: "http://loinc.org", code: "8327-9", display: "Measurement location" }, temp.measurement_location, null);
    }
    if (temp.measurement_location_comment) {
      pushObs({ system: "http://loinc.org", code: "75341-8", display: "Measurement location comment" }, temp.measurement_location_comment, null);
    }
  }

  return {
    resourceType: "Bundle",
    id: bundleId,
    type: "collection",
    timestamp,
    entry: observations.map(obs => ({ resource: obs }))
  };
}

module.exports = { createFHIRBundle };