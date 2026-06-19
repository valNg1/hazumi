-- Tous complets
update judokas
set cotisation_paid = true,
    cert_medical_ok = true,
    virement_url = 'https://placeholder.com/virement';

-- 10 dossiers incomplets

-- Virement manquant
update judokas set virement_url = null
where full_name in ('BREHERET Lise', 'CLEMOT Lilian', 'ERRAJI Oumnia');

-- Certif manquant
update judokas set cert_medical_ok = false
where full_name in ('DE CUGNAC Wandrille', 'MOUCHON Pauline', 'SCRIBE Isaac');

-- Cotisation manquante
update judokas set cotisation_paid = false
where full_name in ('ROUZE Anaïs', 'STREPENNE Etoile');

-- Virement + certif manquants
update judokas set virement_url = null, cert_medical_ok = false
where full_name in ('GERARDIN Flore', 'EMBRY Agathe');
