// Demo accounts that bypass club access verification
// ⚠️ IMPORTANT: Cette liste est manuelle et doit être supprimée avant le passage en production réelle.
// En production, utiliser un système d'authentification propre (rôles utilisateur, tokens, etc.)
const DEMO_EMAILS = ['valery.nguyen@yahoo.fr', 'demo@hazumi.org']

export async function isBenDemoAccount(userEmail: string | null | undefined): Promise<boolean> {
  return DEMO_EMAILS.some(email => userEmail?.toLowerCase() === email.toLowerCase())
}
