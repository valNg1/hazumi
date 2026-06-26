// Demo accounts that bypass club access verification
const DEMO_EMAILS = ['valery.nguyen@yahoo.fr', 'demo@hazumi.org']

export async function isBenDemoAccount(userEmail: string | null | undefined): Promise<boolean> {
  return DEMO_EMAILS.some(email => userEmail?.toLowerCase() === email.toLowerCase())
}
