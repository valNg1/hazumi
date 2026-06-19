-- Tous les dossiers complets par défaut
update judokas
set cotisation_paid = true,
    cert_medical_ok = true,
    virement_url = 'https://placeholder.com/virement'
where user_id is null;

-- 10 dossiers incomplets (raisons variées)

-- Manque virement uniquement
update judokas set virement_url = null
where full_name in ('BREHERET Lise', 'CLEMOT Lilian', 'ERRAJI Oumnia');

-- Manque certificat médical uniquement
update judokas set cert_medical_ok = false
where full_name in ('DE CUGNAC Wandrille', 'MOUCHON Pauline', 'SCRIBE Isaac');

-- Manque cotisation uniquement
update judokas set cotisation_paid = false
where full_name in ('ROUZE Anaïs', 'STREPENNE Etoile');

-- Manque virement + certificat
update judokas set virement_url = null, cert_medical_ok = false
where full_name in ('GERARDIN Flore', 'EMBRY Agathe');
