// Demo account: Ben (valery.nguyen@yahoo.fr) gets all Pro features for free
const BEN_EMAIL = 'valery.nguyen@yahoo.fr'

export async function isBenDemoAccount(userEmail: string | null | undefined): Promise<boolean> {
  return userEmail?.toLowerCase() === BEN_EMAIL.toLowerCase()
}
